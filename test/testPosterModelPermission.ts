import { Signer, Contract, BigNumber, utils } from "ethers";
import { expect } from "chai";

import { loadFixture, fixtureDefault } from "./utils/fixtures";
import { AddressZero, Zero } from "./utils/constants";

describe("Test PosterModel", () => {
  let accounts: Signer[];

  let Oracle: Contract;

  let PosterModel: Contract;
  let ReaderPosterModel: Contract;
  let PosterHeartbeatModel: Contract;
  let ReaderPosterHeartbeatModel: Contract;

  let WBTC: Contract;
  let USDC: Contract;
  let BUSD: Contract;

  async function init() {
    ({
      accounts,
      Oracle,
      PosterModel,
      ReaderPosterModel,
      PosterHeartbeatModel,
      ReaderPosterHeartbeatModel,
      WBTC,
      USDC,
      BUSD,
    } = await loadFixture(fixtureDefault));
  }

  before(async function () {
    await init();
  });

  // _setMaxSwing
  it("test _setMaxSwing: sender is not the owner, expected revert", async () => {
    let maxSwing = utils.parseEther("0.01");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setMaxSwing(maxSwing)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setMaxSwing: maxSwing = oldMaxSwing, expected revert", async () => {
    let maxSwing = utils.parseEther("0.1");
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwing(maxSwing)
    ).to.be.revertedWith(
      "_setMaxSwing: Old and new values cannot be the same."
    );
  });

  it("test _setMaxSwing: maxSwing > 10%, expected revert", async () => {
    let maxSwing = utils.parseEther("0.11");
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwing(maxSwing)
    ).to.be.revertedWith("_setMaxSwing: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwing: maxSwing < 0.1%, expected revert", async () => {
    let maxSwing = utils.parseEther("0.0009");
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwing(maxSwing)
    ).to.be.revertedWith("_setMaxSwing: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwing: 10% > maxSwing > 0.1%, success", async () => {
    let maxSwing = utils.parseEther("0.01");
    await ReaderPosterHeartbeatModel._setMaxSwing(maxSwing);
  });

  // _setMaxSwings
  it("test _setMaxSwings: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let maxSwing = utils.parseEther("0.01");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setMaxSwings(
        asset,
        maxSwing
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setMaxSwings: maxSwing = oldMaxSwing, expected revert", async () => {
    let asset = WBTC.address;
    let maxSwing = Zero;
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwings(asset, maxSwing)
    ).to.be.revertedWith(
      "_setMaxSwingsInternal: Old and new values cannot be the same."
    );
  });

  it("test _setMaxSwings: maxSwing > 10%, expected revert", async () => {
    let asset = WBTC.address;
    let maxSwing = utils.parseEther("0.11");
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwings(asset, maxSwing)
    ).to.be.revertedWith("_setMaxSwingsInternal: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwings: maxSwing < 0.1%, expected revert", async () => {
    let asset = WBTC.address;
    let maxSwing = utils.parseEther("0.0009");
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwings(asset, maxSwing)
    ).to.be.revertedWith("_setMaxSwingsInternal: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwings: 10% > maxSwing > 0.1%, success", async () => {
    let asset = WBTC.address;
    let maxSwing = utils.parseEther("0.01");
    await ReaderPosterHeartbeatModel._setMaxSwings(asset, maxSwing);
  });

  // _setMaxSwingsBatch
  it("test _setMaxSwingsBatch: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let maxSwings = [utils.parseEther("0.1")];
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setMaxSwingsBatch(
        assets,
        maxSwings
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setMaxSwingsBatch: maxSwing = oldMaxSwing, expected revert", async () => {
    let assets = [WBTC.address];
    let maxSwings = [utils.parseEther("0.01")];
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwingsBatch(assets, maxSwings)
    ).to.be.revertedWith(
      "_setMaxSwingsInternal: Old and new values cannot be the same."
    );
  });

  it("test _setMaxSwingsBatch: maxSwing > 10%, expected revert", async () => {
    let assets = [WBTC.address];
    let maxSwings = [utils.parseEther("0.11")];
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwingsBatch(assets, maxSwings)
    ).to.be.revertedWith("_setMaxSwingsInternal: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwingsBatch: maxSwing < 0.1%, expected revert", async () => {
    let assets = [WBTC.address];
    let maxSwings = [utils.parseEther("0.0009")];
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwingsBatch(assets, maxSwings)
    ).to.be.revertedWith("_setMaxSwingsInternal: 0.1% <= _maxSwing <= 10%.");
  });

  it("test _setMaxSwingsBatch: assets and price models do not correspond, expected revert", async () => {
    let assets = [WBTC.address, USDC.address];
    let maxSwings = [utils.parseEther("0.1")];
    await expect(
      ReaderPosterHeartbeatModel._setMaxSwingsBatch(assets, maxSwings)
    ).to.be.revertedWith(
      "_setMaxSwingForAssetBatch: assets & maxSwings must match the current length."
    );
  });

  it("test _setMaxSwingsBatch: 10% > maxSwing > 0.1%, success", async () => {
    let assets = [WBTC.address];
    let maxSwings = [utils.parseEther("0.1")];
    await ReaderPosterHeartbeatModel._setMaxSwingsBatch(assets, maxSwings);
  });

  // _setPendingAnchor
  it("test _setPendingAnchor: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let newScaledPrice = utils.parseEther("0.01");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setPendingAnchor(
        asset,
        newScaledPrice
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setPendingAnchor: sender is the owner, success", async () => {
    let asset = WBTC.address;
    let newScaledPrice = utils.parseEther("0.01");
    await ReaderPosterHeartbeatModel._setPendingAnchor(asset, newScaledPrice);
  });

  // _setReader
  it("test _setReader: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let reader = USDC.address;
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setReader(asset, reader)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setReader: reader = asset, expected revert", async () => {
    let asset = WBTC.address;
    let reader = asset;
    await expect(
      ReaderPosterHeartbeatModel._setReader(asset, reader)
    ).to.be.revertedWith(
      "_setReaderInternal: asset and readAsset cannot be the same."
    );
  });

  it("test _setReader: reader = 0, success", async () => {
    let asset = WBTC.address;
    let reader = AddressZero;
    await ReaderPosterHeartbeatModel._setReader(asset, reader);
    expect((await ReaderPosterHeartbeatModel.reader(asset))[0]).to.eq(reader);
  });

  it("test _setReader: reader != asset, success", async () => {
    let asset = WBTC.address;
    let reader = USDC.address;
    await ReaderPosterHeartbeatModel._setReader(asset, reader);
    expect((await ReaderPosterHeartbeatModel.reader(asset))[0]).to.eq(reader);
  });

  // _setReaderBatch
  it("test _setReaderBatch: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let readers = [USDC.address];
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setReaderBatch(
        assets,
        readers
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setReaderBatch: assets and readers do not correspond, expected revert", async () => {
    let assets = [WBTC.address, USDC.address];
    let readers = [USDC.address];
    await expect(
      ReaderPosterHeartbeatModel._setReaderBatch(assets, readers)
    ).to.be.revertedWith(
      "_setReaderBatch: assets & readAssets must match the current length."
    );
  });

  it("test _setReaderBatch: standard operation, success", async () => {
    let assets = [WBTC.address];
    let readers = [USDC.address];
    await ReaderPosterHeartbeatModel._setReaderBatch(assets, readers);
    expect((await ReaderPosterHeartbeatModel.reader(assets[0]))[0]).to.eq(
      readers[0]
    );
  });

  // _setDefaultValidInterval
  it("test _setDefaultValidInterval: sender is not the owner, expected revert", async () => {
    let heartbeat = utils.parseUnits("3600", "wei");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setDefaultValidInterval(
        heartbeat
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setDefaultValidInterval: heartbeat = oldHeartbeat, expected revert", async () => {
    let heartbeat = await ReaderPosterHeartbeatModel.defaultValidInterval();
    await expect(
      ReaderPosterHeartbeatModel._setDefaultValidInterval(heartbeat)
    ).to.be.revertedWith(
      "_setDefaultValidInterval: defaultValidInterval is invalid!"
    );
  });

  it("test _setDefaultValidInterval: standard operation, expected revert", async () => {
    let heartbeat = utils.parseUnits("3600", "wei");
    await ReaderPosterHeartbeatModel._setDefaultValidInterval(heartbeat);
    expect(await ReaderPosterHeartbeatModel.defaultValidInterval()).to.eq(
      heartbeat
    );
  });

  // _setAssetValidInterval
  it("test _setAssetValidInterval: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let heartbeat = utils.parseUnits("3600", "wei");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setAssetValidInterval(
        asset,
        heartbeat
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssetValidInterval: heartbeat = oldHeartbeat, expected revert", async () => {
    let asset = WBTC.address;
    let heartbeat = await ReaderPosterHeartbeatModel.validInterval(asset);
    await expect(
      ReaderPosterHeartbeatModel._setAssetValidInterval(asset, heartbeat)
    ).to.be.revertedWith(
      "_setAssetValidIntervalInternal: validInterval is invalid!"
    );
  });

  it("test _setAssetValidInterval: standard operation, success", async () => {
    let asset = WBTC.address;
    let heartbeat = utils.parseUnits("3600", "wei");
    await ReaderPosterHeartbeatModel._setAssetValidInterval(asset, heartbeat);
    expect(await ReaderPosterHeartbeatModel.validInterval(asset)).to.eq(
      heartbeat
    );
  });

  // _setAssetValidIntervalBatch
  it("test _setAssetValidIntervalBatch: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let heartbeats = [Zero];
    await expect(
      ReaderPosterHeartbeatModel.connect(
        accounts[0]
      )._setAssetValidIntervalBatch(assets, heartbeats)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssetValidIntervalBatch: assets and heartbeats do not correspond, expected revert", async () => {
    let assets = [WBTC.address, USDC.address];
    let heartbeats = [Zero];
    await expect(
      ReaderPosterHeartbeatModel._setAssetValidIntervalBatch(assets, heartbeats)
    ).to.be.revertedWith(
      "_setAssetValidIntervalBatch: assets & validIntervals must match the current length."
    );
  });

  it("test _setAssetValidIntervalBatch: standard operation, success", async () => {
    let assets = [WBTC.address];
    let heartbeats = [Zero];
    await ReaderPosterHeartbeatModel._setAssetValidIntervalBatch(
      assets,
      heartbeats
    );
    expect(await ReaderPosterHeartbeatModel.validInterval(assets[0])).to.eq(
      heartbeats[0]
    );
  });

  // _setPrice
  it("test _setPrice: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let requestedPrice = utils.parseEther("0.01");
    await expect(
      ReaderPosterHeartbeatModel.connect(accounts[0])._setPrice(
        asset,
        requestedPrice
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });
});
