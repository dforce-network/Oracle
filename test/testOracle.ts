import { ethers, waffle, network } from "hardhat";
import { Signer, Contract, BigNumber, utils } from "ethers";
import { expect } from "chai";

import { deployMockContract } from "@ethereum-waffle/mock-contract";

import {
  loadFixture,
  deployContract,
  instantiateContract,
  fixtureDefault,
} from "./utils/fixtures";
import { getCallData } from "./utils/helper";
import { MAX, Zero, BASE, AddressZero, AbiCoder } from "./utils/constants";

const IPriceModel = require("../artifacts/contracts/interface/IPriceModel.sol/IPriceModel.json");

describe("Test Oracle all owner permissions", () => {
  let owner: Signer;
  let poster: Signer;
  let accounts: Signer[];

  let ProxyAdmin: Contract;

  let MockSequencer: Contract;
  let MockSequencerUptimeFeed: Contract;

  let Oracle: Contract;

  let PosterModel: Contract;
  let ReaderPosterModel: Contract;
  let PosterHeartbeatModel: Contract;
  let ReaderPosterHeartbeatModel: Contract;

  let ChainlinkModel: Contract;
  let ChainlinkHeartbeatModel: Contract;
  // let ChainlinkStocksModel: Contract;

  let Layer2PosterModel: Contract;
  let Layer2PosterHeartbeatModel: Contract;
  let Layer2ReaderPosterHeartbeatModel: Contract;

  let Layer2ChainlinkModel: Contract;
  let Layer2ChainlinkHeartbeatModel: Contract;
  // let Layer2ChainlinkStocksModel: Contract;

  let WBTC: Contract;
  let USDC: Contract;
  let BUSD: Contract;

  async function init() {
    ({
      owner,
      poster,
      accounts,
      ProxyAdmin,
      MockSequencer,
      MockSequencerUptimeFeed,
      Oracle,
      PosterModel,
      ReaderPosterModel,
      PosterHeartbeatModel,
      ReaderPosterHeartbeatModel,
      ChainlinkModel,
      ChainlinkHeartbeatModel,
      // ChainlinkStocksModel,
      Layer2PosterModel,
      Layer2PosterHeartbeatModel,
      Layer2ReaderPosterHeartbeatModel,
      Layer2ChainlinkModel,
      Layer2ChainlinkHeartbeatModel,
      // Layer2ChainlinkStocksModel,
      WBTC,
      USDC,
      BUSD,
    } = await loadFixture(fixtureDefault));
  }

  async function authorize(priceModel: Contract) {
    if (
      (await priceModel.owner()) != Oracle.address &&
      (await priceModel.pendingOwner()) != Oracle.address
    )
      await priceModel._setPendingOwner(Oracle.address);

    if ((await priceModel.pendingOwner()) == Oracle.address) {
      let target = priceModel.address;
      let signature = "_acceptOwner()";
      let data = "0x";
      await Oracle._executeTransaction(target, signature, data);
    }
    expect(await priceModel.owner()).to.eq(Oracle.address);
  }

  async function cancelAuthorization(priceModel: Contract) {
    let ownerAddress = await owner.getAddress();
    if ((await priceModel.owner()) == Oracle.address) {
      let target = priceModel.address;
      let signature = "_setPendingOwner(address)";
      let data = AbiCoder.encode(["address"], [ownerAddress]);
      await Oracle._executeTransaction(target, signature, data);
      expect(await priceModel.pendingOwner()).to.eq(ownerAddress);
    }

    if ((await priceModel.pendingOwner()) == ownerAddress)
      await priceModel._acceptOwner();
    expect(await priceModel.owner()).to.eq(ownerAddress);
  }

  before(async function () {
    await init();
  });

  // initialize
  it("test initialize, expected revert", async () => {
    let ownerAddress = await owner.getAddress();
    await expect(Oracle.initialize(ownerAddress)).to.be.revertedWith(
      "Initializable: contract is already initialized"
    );
  });

  // _setPaused
  it("test _setPaused: sender is not the owner, expected revert", async () => {
    let paused = await Oracle.paused();
    await expect(
      Oracle.connect(accounts[0])._setPaused(!paused)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setPaused: set pause to true, success", async () => {
    expect(await Oracle.paused()).to.eq(false);
    let paused = true;
    await Oracle._setPaused(paused);
    expect(await Oracle.paused()).to.eq(paused);
  });

  it("test _setPaused: set pause to false, success", async () => {
    expect(await Oracle.paused()).to.eq(true);
    let paused = false;
    await Oracle._setPaused(paused);
    expect(await Oracle.paused()).to.eq(paused);
  });

  it("test _setPaused: set the current pause state, success", async () => {
    await Oracle._setPaused(await Oracle.paused());
  });

  // _setPoster
  it("test _setPoster: sender is not the owner, expected revert", async () => {
    let posterAddress = await accounts[0].getAddress();
    await expect(
      Oracle.connect(accounts[0])._setPoster(posterAddress)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setPoster: set an existing poster, expected revert", async () => {
    let posterAddress = await Oracle.poster();
    await expect(Oracle._setPoster(posterAddress)).to.be.revertedWith(
      "_setPoster: poster address invalid!"
    );
  });

  it("test _setPoster: set the poster to zero address, success", async () => {
    let posterAddress = AddressZero;
    expect(await Oracle.poster()).to.not.equal(posterAddress);
    await Oracle._setPoster(posterAddress);
    expect(await Oracle.poster()).to.eq(posterAddress);
  });

  it("test _setPoster: set the poster to normal address, success", async () => {
    let posterAddress = await poster.getAddress();
    expect(await Oracle.poster()).to.not.equal(posterAddress);
    await Oracle._setPoster(posterAddress);
    expect(await Oracle.poster()).to.eq(posterAddress);
  });

  // _setAssetPriceModel
  it("test _setAssetPriceModel: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let priceModel = ChainlinkHeartbeatModel.address;
    await expect(
      Oracle.connect(accounts[0])._setAssetPriceModel(asset, priceModel)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssetPriceModel: set price model to zero address, expected revert", async () => {
    let asset = WBTC.address;
    let priceModel = AddressZero;
    await expect(
      Oracle._setAssetPriceModel(asset, priceModel)
    ).to.be.revertedWith("function call to a non-contract account");
  });

  it("test _setAssetPriceModel: set price model to non-standard contract, expected revert", async () => {
    let asset = WBTC.address;
    const mockPriceModel = await deployMockContract(
      accounts[0],
      IPriceModel.abi
    );
    await mockPriceModel.mock.isPriceModel.returns(false);
    let priceModel = mockPriceModel.address;
    await expect(
      Oracle._setAssetPriceModel(asset, priceModel)
    ).to.be.revertedWith(
      "_setAssetPriceModelInternal: This is not the priceModel_ contract!"
    );
  });

  it("test _setAssetPriceModel: set price model to standard contract, success", async () => {
    let asset = WBTC.address;
    let priceModel = ChainlinkHeartbeatModel.address;
    expect(await Oracle.priceModel(asset)).to.not.equal(priceModel);
    await Oracle._setAssetPriceModel(asset, priceModel);
    expect(await Oracle.priceModel(asset)).to.eq(priceModel);
  });

  it("test _setAssetPriceModel: repeat set price model, success", async () => {
    let asset = WBTC.address;
    let priceModel = await Oracle.priceModel(asset);
    await Oracle._setAssetPriceModel(asset, priceModel);
    expect(await Oracle.priceModel(asset)).to.eq(priceModel);
  });

  // _setAssetPriceModelBatch
  it("test _setAssetPriceModelBatch: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let priceModels = [ChainlinkHeartbeatModel.address];
    await expect(
      Oracle.connect(accounts[0])._setAssetPriceModelBatch(assets, priceModels)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssetPriceModelBatch: set multiple price models, assets and price models do not correspond, expected revert", async () => {
    let assets = [WBTC.address, USDC.address];
    let priceModels = [ChainlinkHeartbeatModel.address];
    await expect(
      Oracle._setAssetPriceModelBatch(assets, priceModels)
    ).to.be.revertedWith(
      "_setAssetStatusOracleBatch: assets & priceModels must match the current length."
    );
  });

  it("test _setAssetPriceModelBatch: set multiple price models, including non-standard price models, expected revert", async () => {
    const mockPriceModel = await deployMockContract(
      accounts[0],
      IPriceModel.abi
    );
    await mockPriceModel.mock.isPriceModel.returns(false);
    let assets = [WBTC.address, USDC.address];
    let priceModels = [ChainlinkHeartbeatModel.address, mockPriceModel.address];
    await expect(
      Oracle._setAssetPriceModelBatch(assets, priceModels)
    ).to.be.revertedWith(
      "_setAssetPriceModelInternal: This is not the priceModel_ contract!"
    );
  });

  it("test _setAssetPriceModelBatch: set multiple price models, success", async () => {
    let assets = [BUSD.address, USDC.address];
    let priceModels = [ChainlinkHeartbeatModel.address, ChainlinkModel.address];
    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index];
      const priceModel = priceModels[index];

      expect(await Oracle.priceModel(asset)).to.not.equal(priceModel);
    }
    await Oracle._setAssetPriceModelBatch(assets, priceModels);
    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index];
      const priceModel = priceModels[index];

      expect(await Oracle.priceModel(asset)).to.eq(priceModel);
    }
  });

  // _disableAssetPriceModel
  it("test _disableAssetPriceModel: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    await expect(
      Oracle.connect(accounts[0])._disableAssetPriceModel(asset)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _disableAssetPriceModel: disable asset price models, success", async () => {
    let asset = WBTC.address;
    expect(await Oracle.priceModel(asset)).to.not.equal(AddressZero);
    await Oracle._disableAssetPriceModel(asset);
    expect(await Oracle.priceModel(asset)).to.eq(AddressZero);
  });

  it("test _disableAssetPriceModel: disable asset price models again, success", async () => {
    let asset = WBTC.address;
    expect(await Oracle.priceModel(asset)).to.eq(AddressZero);
    await Oracle._disableAssetPriceModel(asset);
    expect(await Oracle.priceModel(asset)).to.eq(AddressZero);
  });

  // _disableAssetStatusOracleBatch
  it("test _disableAssetStatusOracleBatch: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    await expect(
      Oracle.connect(accounts[0])._disableAssetStatusOracleBatch(assets)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _disableAssetStatusOracleBatch: disable asset price models, success", async () => {
    let assets = [USDC.address, BUSD.address];
    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index];
      expect(await Oracle.priceModel(asset)).to.not.equal(AddressZero);
    }
    await Oracle._disableAssetStatusOracleBatch(assets);
    for (let index = 0; index < assets.length; index++) {
      const asset = assets[index];
      expect(await Oracle.priceModel(asset)).to.eq(AddressZero);
    }
  });

  // _executeTransaction
  it("test _executeTransaction: sender is not the owner, expected revert", async () => {
    let target = PosterModel.address;
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]);
    await expect(
      Oracle.connect(accounts[0])._executeTransaction(target, signature, data)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _executeTransaction: target not authorized, expected revert", async () => {
    let target = PosterModel.address;
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]);
    await expect(
      Oracle._executeTransaction(target, signature, data)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _executeTransaction: target authorized, success", async () => {
    await authorize(PosterModel);
    let target = PosterModel.address;
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.05")]);
    await Oracle._executeTransaction(target, signature, data);
  });

  it("test _executeTransaction: target authorized, target execution error, expected revert", async () => {
    await authorize(PosterModel);
    let target = PosterModel.address;
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.05")]);
    await expect(
      Oracle._executeTransaction(target, signature, data)
    ).to.be.revertedWith(
      "_setMaxSwing: Old and new values cannot be the same."
    );
  });

  // _executeTransactions
  it("test _executeTransactions: sender is not the owner, expected revert", async () => {
    let targets = [PosterModel.address];
    let signatures = ["_setMaxSwing(uint256)"];
    let callData = [AbiCoder.encode(["uint256"], [utils.parseEther("0.01")])];
    await expect(
      Oracle.connect(accounts[0])._executeTransactions(
        targets,
        signatures,
        callData
      )
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _executeTransactions: target not authorized, expected revert", async () => {
    let targets = [PosterModel.address, ReaderPosterModel.address];
    let signatures = ["_setMaxSwing(uint256)", "_setMaxSwing(uint256)"];
    let callData = [
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
    ];
    await expect(
      Oracle._executeTransactions(targets, signatures, callData)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _executeTransactions: target authorized, success", async () => {
    await authorize(PosterModel);
    let targets = [PosterModel.address];
    let signatures = ["_setMaxSwing(uint256)"];
    let callData = [AbiCoder.encode(["uint256"], [utils.parseEther("0.1")])];
    await Oracle._executeTransactions(targets, signatures, callData);
  });

  it("test _executeTransactions: target authorized, target execution error, expected revert", async () => {
    await authorize(PosterModel);
    let targets = [PosterModel.address];
    let signatures = ["_setMaxSwing(uint256)"];
    let callData = [AbiCoder.encode(["uint256"], [utils.parseEther("1")])];
    await expect(
      Oracle._executeTransactions(targets, signatures, callData)
    ).to.be.revertedWith("_setMaxSwing: 0.1% <= _maxSwing <= 10%.");
  });

  // _setAsset
  it("test _setAsset: sender is not the owner, expected revert", async () => {
    let asset = WBTC.address;
    let priceModel = PosterModel.address;
    await Oracle._setAssetPriceModel(asset, priceModel);
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]);
    await expect(
      Oracle.connect(accounts[0])._setAsset(asset, signature, data)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAsset: asset has no set price model, expected revert", async () => {
    let asset = WBTC.address;
    await Oracle._disableAssetPriceModel(asset);
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]);
    await expect(Oracle._setAsset(asset, signature, data)).to.be.revertedWith(
      "Address: call to non-contract"
    );
  });

  it("test _setAsset: price model of the asset is not authorized, expected revert", async () => {
    await cancelAuthorization(PosterModel);
    let asset = WBTC.address;
    let priceModel = PosterModel.address;
    await Oracle._setAssetPriceModel(asset, priceModel);
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]);
    await expect(Oracle._setAsset(asset, signature, data)).to.be.revertedWith(
      "onlyOwner: caller is not the owner"
    );
  });

  it("test _setAsset: asset's price model is authorized, success", async () => {
    await authorize(PosterModel);
    let asset = WBTC.address;
    let signature = "_setMaxSwing(uint256)";
    let data = AbiCoder.encode(["uint256"], [utils.parseEther("0.02")]);
    await Oracle._setAsset(asset, signature, data);
  });

  // _setAssets
  it("test _setAssets: sender is not the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let signatures = ["_setMaxSwing(uint256)"];
    let callData = [AbiCoder.encode(["uint256"], [utils.parseEther("0.01")])];
    await expect(
      Oracle.connect(accounts[0])._setAssets(assets, signatures, callData)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssets: asset has no set price model, expected revert", async () => {
    let assets = [WBTC.address, USDC.address];
    let signatures = ["_setMaxSwing(uint256)", "_setMaxSwing(uint256)"];
    let callData = [
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
    ];
    await expect(
      Oracle._setAssets(assets, signatures, callData)
    ).to.be.revertedWith("Address: call to non-contract");
  });

  it("test _setAssets: price model of the asset is not authorized, expected revert", async () => {
    await cancelAuthorization(PosterModel);
    let assets = [WBTC.address, USDC.address];
    let signatures = ["_setMaxSwing(uint256)", "_setMaxSwing(uint256)"];
    let callData = [
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
    ];
    await expect(
      Oracle._setAssets(assets, signatures, callData)
    ).to.be.revertedWith("onlyOwner: caller is not the owner");
  });

  it("test _setAssets: asset's price model is authorized, success", async () => {
    await authorize(PosterModel);
    await Oracle._setAssetPriceModel(USDC.address, PosterModel.address);
    let assets = [WBTC.address, USDC.address];
    let signatures = ["_setMaxSwing(uint256)", "_setMaxSwing(uint256)"];
    let callData = [
      AbiCoder.encode(["uint256"], [utils.parseEther("0.01")]),
      AbiCoder.encode(["uint256"], [utils.parseEther("0.03")]),
    ];
    await Oracle._setAssets(assets, signatures, callData);
  });

  // setPrice
  it("test setPrice: sender is not the poster, expected revert", async () => {
    let asset = WBTC.address;
    let requestedPrice = utils.parseEther("0.01");
    await expect(
      Oracle.connect(accounts[0]).setPrice(asset, requestedPrice)
    ).to.be.revertedWith("onlyPoster: caller is not the poster");
  });

  it("test setPrice: sender is the owner, expected revert", async () => {
    let asset = WBTC.address;
    let requestedPrice = utils.parseEther("0.01");
    await expect(
      Oracle.connect(owner).setPrice(asset, requestedPrice)
    ).to.be.revertedWith("onlyPoster: caller is not the poster");
  });

  it("test setPrice: sender is the poster, success", async () => {
    let asset = WBTC.address;
    let requestedPrice = utils.parseEther("0.01");
    await Oracle.connect(poster).setPrice(asset, requestedPrice);
    expect(await Oracle.callStatic.getUnderlyingPrice(asset)).to.eq(
      requestedPrice
    );
  });

  // setPrices
  it("test setPrices: sender is not the poster, expected revert", async () => {
    let assets = [WBTC.address];
    let requestedPrices = [utils.parseEther("0.01")];
    await expect(
      Oracle.connect(accounts[0]).setPrices(assets, requestedPrices)
    ).to.be.revertedWith("onlyPoster: caller is not the poster");
  });

  it("test setPrices: sender is the owner, expected revert", async () => {
    let assets = [WBTC.address];
    let requestedPrices = [utils.parseEther("0.01")];
    await expect(
      Oracle.connect(owner).setPrices(assets, requestedPrices)
    ).to.be.revertedWith("onlyPoster: caller is not the poster");
  });

  it("test setPrices: sender is the poster, success", async () => {
    let assets = [WBTC.address];
    let requestedPrices = [utils.parseEther("0.0101")];
    await Oracle.connect(poster).setPrices(assets, requestedPrices);
    expect(await Oracle.callStatic.getUnderlyingPrice(assets[0])).to.eq(
      requestedPrices[0]
    );
  });

  // NotPaused
  it("test NotPaused: when paused, price and status are default, success", async () => {
    let asset = WBTC.address;
    let data = await Oracle.callStatic.getUnderlyingPriceAndStatus(asset);
    expect(data[0].gt(Zero)).to.eq(true);
    expect(data[1]).to.eq(true);

    await Oracle._setPaused(true);
    expect(await Oracle.paused()).to.eq(true);

    data = await Oracle.callStatic.getUnderlyingPriceAndStatus(asset);
    expect(data[0]).to.eq(Zero);
    expect(data[1]).to.eq(false);

    await Oracle._setPaused(false);
  });

  // hasModel
  it("test hasModel: asset with no price model set, price and status are default, success", async () => {
    let asset = WBTC.address;
    let data = await Oracle.callStatic.getUnderlyingPriceAndStatus(asset);
    let price = await Oracle.callStatic.getUnderlyingPrice(asset);
    let status = await Oracle.callStatic.getAssetPriceStatus(asset);
    expect(data[0].gt(Zero)).to.eq(true);
    expect(data[1]).to.eq(true);
    expect(price.gt(Zero)).to.eq(true);
    expect(status).to.eq(true);

    await Oracle._disableAssetPriceModel(asset);

    expect(await Oracle.paused()).to.eq(false);

    data = await Oracle.callStatic.getUnderlyingPriceAndStatus(asset);
    price = await Oracle.callStatic.getUnderlyingPrice(asset);
    status = await Oracle.callStatic.getAssetPriceStatus(asset);
    expect(data[0]).to.eq(Zero);
    expect(data[1]).to.eq(false);
    expect(price).to.eq(Zero);
    expect(status).to.eq(false);
  });
});
