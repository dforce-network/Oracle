#!/usr/bin/env python3
"""
Conflux eSpace price-oracle monitor.

Checks the Conflux community oracle (Pyth-compatible drop-in that replaced Pyth on
Conflux eSpace) for:
  1. Feed liveness       - priceFeedExists for every feed
  2. Price validation    - age vs the oracle's validTimePeriod (staleness)
  3. Update freshness    - age vs the expected update interval (missed-batch detector)
  4. Reference deviation - on-chain price vs Pyth Hermes (same feed IDs, off-chain)

Uses `curl` for HTTP (fast + universally available; python-urllib was unreliable on
macOS keep-alive) and a single JSON-RPC batch for all on-chain reads.
Exit code 0 = all OK, 1 = at least one WARN/FAIL (useful for alerting).
"""
import json
import subprocess
import sys

RPC = "https://evm.confluxrpc.com"
HERMES = "https://hermes.pyth.network/v2/updates/price/latest"
ORACLE = "0x5286BD91e2C79fE066926a15193C7e531bBF6750"
UA = "conflux-oracle-monitor/1.0"

EXPECTED_INTERVAL = 3600          # feeds update hourly
DEV_CRYPTO = 0.01                 # 1%   alert threshold for volatile assets
DEV_STABLE = 0.005                # 0.5% alert threshold for stablecoins / FX

# sym -> (feedId, is_stable, has_pyth_reference)
FEEDS = {
    "BTC":   ("e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", False, True),
    "ETH":   ("ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", False, True),
    "USDT":  ("2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b", True,  True),
    "USDC":  ("eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", True,  True),
    "CFX":   ("8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933", False, True),
    "BNB":   ("2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f", False, True),
    "AxCNH": ("6412f0e5469e5ab64fccf0eea916ae6db2bcd56568daaaf583b3054d465e8e2d", True,  False),  # custom ID, no Pyth ref
}

# keccak256(sig)[:4]
SEL_VALID_PERIOD = "0xe18910a3"          # getValidTimePeriod()
SEL_EXISTS = "0xb5ec0261"                # priceFeedExists(bytes32)
SEL_PRICE = "0x96834ad3"                 # getPriceUnsafe(bytes32)


def curl(url, data=None):
    cmd = ["curl", "-s", "--max-time", "25", "-H", f"User-Agent: {UA}"]
    if data is not None:
        cmd += ["-X", "POST", "-H", "Content-Type: application/json", "--data", data]
    cmd.append(url)
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=40)
    if out.returncode != 0 or not out.stdout:
        raise RuntimeError(f"curl failed ({out.returncode}): {out.stderr.strip()}")
    return json.loads(out.stdout)


def to_int(hexword, signed=False):
    # ABI encodes every field in a full 256-bit word (negative ints are
    # sign-extended to 256 bits), so always interpret at 256-bit width.
    v = int(hexword, 16)
    if signed and v >= 1 << 255:
        v -= 1 << 256
    return v


def rpc_batch():
    """One JSON-RPC batch: block timestamp, validTimePeriod, and per-feed exists+price."""
    reqs = [
        {"jsonrpc": "2.0", "id": "ts", "method": "eth_getBlockByNumber", "params": ["latest", False]},
        {"jsonrpc": "2.0", "id": "vtp", "method": "eth_call",
         "params": [{"to": ORACLE, "data": SEL_VALID_PERIOD}, "latest"]},
    ]
    for sym, (fid, _, _) in FEEDS.items():
        reqs.append({"jsonrpc": "2.0", "id": f"ex:{sym}", "method": "eth_call",
                     "params": [{"to": ORACLE, "data": SEL_EXISTS + fid}, "latest"]})
        reqs.append({"jsonrpc": "2.0", "id": f"px:{sym}", "method": "eth_call",
                     "params": [{"to": ORACLE, "data": SEL_PRICE + fid}, "latest"]})
    res = curl(RPC, json.dumps(reqs))
    return {r["id"]: r for r in res}


def parse_price(hexstr):
    raw = hexstr[2:]
    w = [raw[i:i + 64] for i in range(0, len(raw), 64)]
    return (to_int(w[0], signed=True),    # price  (int64)
            to_int(w[1]),                  # conf   (uint64)
            to_int(w[2], signed=True),     # expo   (int32, e.g. -8)
            to_int(w[3]))                  # publishTime (uint64)


def hermes_prices(ids):
    q = "&".join("ids[]=" + i for i in ids)
    d = curl(HERMES + "?" + q)
    return {p["id"].lower(): int(p["price"]["price"]) * (10 ** int(p["price"]["expo"]))
            for p in d["parsed"]}


def main():
    b = rpc_batch()
    now = to_int(b["ts"]["result"]["timestamp"])
    vtp = to_int(b["vtp"]["result"])

    ref = {}
    try:
        ref = hermes_prices([f[0] for _, f in FEEDS.items() if f[2]])
    except Exception as e:
        print(f"(warning: Hermes reference unavailable: {e})")

    print(f"Conflux Oracle Monitor  {ORACLE}")
    print(f"chain time={now}  validTimePeriod={vtp}s  expected update interval={EXPECTED_INTERVAL}s")
    print(f"{'ASSET':<7}{'PRICE':>14}{'AGE_s':>8}{'VALID':>7}{'FRESH':>7}{'REF(pyth)':>13}{'DEV%':>8}  FLAGS")
    print("-" * 82)

    problems = 0
    for sym, (fid, stable, has_ref) in FEEDS.items():
        flags = []
        if to_int(b[f"ex:{sym}"]["result"]) != 1:
            print(f"{sym:<7}{'NO FEED':>14}")
            problems += 1
            continue
        price, conf, expo, pub = parse_price(b[f"px:{sym}"]["result"])
        val = price * (10 ** expo)
        age = now - pub
        valid = age < vtp
        fresh = age < 2 * EXPECTED_INTERVAL
        if not valid:
            flags.append("STALE"); problems += 1
        elif age > EXPECTED_INTERVAL:
            flags.append("late-update")
        if not fresh:
            flags.append("MISSED-BATCH"); problems += 1
        if price <= 0:
            flags.append("NONPOSITIVE"); problems += 1

        devs = ""
        if has_ref and fid in ref and val > 0:
            dev = abs(val - ref[fid]) / ref[fid]
            devs = f"{dev*100:.3f}"
            thr = DEV_STABLE if stable else DEV_CRYPTO
            if dev > thr:
                flags.append(f"DEVIATION>{thr*100:.1f}%"); problems += 1
        refval = f"{ref.get(fid, 0):.4f}" if has_ref and fid in ref else "-"

        print(f"{sym:<7}{val:>14.6f}{age:>8}{('yes' if valid else 'NO'):>7}"
              f"{('yes' if fresh else 'NO'):>7}{refval:>13}{devs:>8}  {','.join(flags) if flags else 'ok'}")

    print("-" * 82)
    print("PASS - all feeds live, valid, and within reference tolerance" if problems == 0
          else f"WARN - {problems} issue(s) detected (see FLAGS)")
    return 0 if problems == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
