# Conflux eSpace: Pyth → Conflux Oracle Migration Runbook

Pyth Network shuts down Conflux eSpace price feeds on **2026-07-31**. This runbook
migrates the `PythModel` on Conflux eSpace mainnet (chainId **1030**) from the Pyth
contract to the Conflux community oracle, which is a drop-in Pyth-compatible
replacement (same read API, same feed IDs, `expo = -8`).

- **Old Pyth:** `0xe9d69CdD6Fe41e7B621B4A688C5D1a68cB5c8ADc`
- **New Conflux oracle (proxy):** `0x5286BD91e2C79fE066926a15193C7e531bBF6750`
  (repo: [conflux-fans/oracle-contracts](https://github.com/conflux-fans/oracle-contracts), UUPS proxy — always use the **proxy**, not the implementation)

Only the address changes — `contracts/priceModel/PythModel.sol` is untouched. Because
`PythModel.pyth` is `immutable`, a **new** `PythModel` instance must be deployed.

## Key facts

| | |
|---|---|
| Oracle | `0xfd3868B848B5D9eD3583938B4db4746415bD43a3` |
| Oracle owner | Timelock `0x3f9E89ce069C3a5CAD749C9D953E9b57bEcCb236` |
| Old PythModel | `0x2434A722565E0d5C5b0f515666f39D1e63ef77d6` (owner = Oracle) |
| Affected iTokens | iWBTC, iETH, iCFX, iUSDT, iUSDC (the 5 assets on `priceModel: "PythModel"`) |

Because the Oracle is owned by the Timelock, **every Oracle mutation is a Timelock
proposal** (`Timelock.executeTransactions(targets, values, signatures, calldatas)`).

## Code changes (already committed)

1. [`scripts/config/config.js`](../scripts/config/config.js) — `confluxeSpace.pyth`
   set to the new oracle proxy.
2. [`deployments/Oracle-1030.json`](../deployments/Oracle-1030.json) — `PythModel`
   entry removed so `0_deploy.js` redeploys it against the new address. `0_deploy.js`
   writes the freshly deployed address back into this file; commit that result.

## Migration steps

Run with the deployer key that will own the new model, against Conflux eSpace
(`npx hardhat run scripts/<file> --network confluxeSpace`, or via truffle-dashboard).

### 1. Deploy the new PythModel — `0_deploy.js`

Deploys `PythModel(0x5286…6750)`. Deployer becomes the model owner. Verify:

```
cast call <NEW_MODEL> "pyth()(address)"  --rpc-url https://evm.confluxrpc.com
# -> 0x5286BD91e2C79fE066926a15193C7e531bBF6750
```

### 2. Hand the model to the Oracle — `1_priceModelAuth.js` (partly manual)

The deployer call `PythModel._setPendingOwner(Oracle)` runs directly (deployer owns
the model). The matching `_acceptOwner()` goes through the Oracle, which is
Timelock-owned — so `1_priceModelAuth.js`'s direct `Oracle._executeTransactions(...)`
call will **revert**. Instead submit it as a Timelock proposal:

```
Timelock.executeTransactions(
  targets    = [Oracle],
  values     = [0],
  signatures = ["_executeTransactions(address[],string[],bytes[])"],
  calldatas  = [ abi.encode([NEW_MODEL], ["_acceptOwner()"], ["0x"]) ]
)
```

Confirm `PythModel.owner() == Oracle` before continuing.

### 3. Rewire assets + set feed IDs — `2_setAssets.js`

With `owner == Timelock`, this script **prints** the Timelock proposal instead of
sending it (see `printArgs`). It emits one `Timelock.executeTransactions(...)`
bundling:

- `Oracle._setAssetPriceModelBatch([5 assets], [NEW_MODEL ×5])` — point the iTokens at the new model, then
- `Oracle._setAssets(...)` forwarding `_setAssetFeedID(address,bytes32)` and
  `_setAssetValidInterval(address,uint256)` (heartbeat `90000`) for each asset.

Feed IDs are unchanged from the current config:

| Asset | iToken | Feed ID |
|---|---|---|
| BTC/USD | `0xE08020a6517c1AD321D47c45Efbe1d76F5035d75` | `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| ETH/USD | `0x620e8Ed48945d97CBea0B794F50E5e51950EbA24` | `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace` |
| CFX/USD | `0x25CCd7E60550EF32266fA90441BcE2BA742d88bc` | `0x8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933` |
| USDT/USD | `0xC80aD49191113d31fe52427c01A197106ef5EB5b` | `0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b` |
| USDC/USD | `0xb88DC5AaE0C26903230ebc9a6fBAb8D511AF9897` | `0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a` |

> `_setAssets` forwards each config call to the **currently assigned** model, so the
> `_setAssetPriceModelBatch` (asset → new model) must be ordered **before** the
> `_setAssetFeedID` calls. `2_setAssets.js` already emits them in that order.
> `_setAssetFeedID` requires `pyth.priceFeedExists(feedID) == true`, which holds only
> while the new oracle's updater keeps pushing prices — see prerequisite below.

Queue the printed proposal in the Timelock, wait out the delay, then execute.

### 4. Verify

```
cast call <Oracle> "getUnderlyingPrice(address)(uint256)" <iToken> --rpc-url https://evm.confluxrpc.com
cast call <NEW_MODEL> "getAssetStatus(address)(bool)"   <iToken> --rpc-url https://evm.confluxrpc.com  # -> true
```

Expect non-zero prices matching the pre-migration values within normal drift, and
`getAssetStatus == true` for all 5 assets.

## Prerequisites / watch-outs

- **Updater must be live.** The new oracle only returns a price after its
  `UPDATER_ROLE` account pushes one, and `getAssetStatus` stays healthy only while
  updates land inside the `90000s` heartbeat. Confirm all 5 feeds are fresh on the
  new oracle **before** step 3, and that the updater keeps running after cutover.
- **Do the migration before 2026-07-31** while the old Pyth still serves prices, so
  you can roll back by re-pointing the assets to the old `PythModel` if needed.
- **Testnet (chainId 71) not covered.** Its Conflux oracle is
  `0x838c40B3904FAfBc21b670c97b0dFeE7D8D0a016` with different feed IDs; migrate
  separately if required.

## Verified on a local fork

The full sequence above (deploy → ownership transfer → `_setAssetPriceModelBatch` →
`_setAssets` feed IDs/heartbeats → `getUnderlyingPrice`) was exercised end-to-end on
an `anvil --fork-url https://evm.confluxrpc.com --chain-id 1030` fork, impersonating
the Timelock. All 5 assets returned healthy, non-zero prices matching the live
Pyth-backed Oracle within < ~3.5%.
