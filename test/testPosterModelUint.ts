import { Signer, Contract, BigNumber, utils } from "ethers";
import { expect } from "chai";

import { fixtureDefault } from "./utils/fixtures";
import { increaseBlock, increaseTime, getCurrentTime } from "./utils/helper";
import { Zero, BASE, AddressZero } from "./utils/constants";

const hour: BigNumber = utils.parseUnits("3600", "wei");

describe("Test PosterModel", () => {
  let ReaderPosterHeartbeatModel: Contract;
  let WBTC: Contract;
  let USDC: Contract;
  let BUSD: Contract;

  interface PostState {
    status: boolean;
    price: BigNumber;
  }

  async function init() {
    ({ ReaderPosterHeartbeatModel, WBTC, USDC, BUSD } = await fixtureDefault());
  }
  async function readyToUpdate(
    asset: string,
    requestedPrice: BigNumber,
    postSwing: BigNumber,
    postBuffer: BigNumber
  ) {
    let postState: PostState = {
      status: true,
      price: requestedPrice,
    };
    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );

    let reader = await ReaderPosterHeartbeatModel.reader(asset);

    if (reader[0] != AddressZero) {
      postState.status = false;
      postState.price = price;
      return postState;
    }

    if (price.eq(Zero)) return postState;

    let maxSwing = await ReaderPosterHeartbeatModel.maxSwings(asset);
    if (maxSwing.eq(Zero))
      maxSwing = await ReaderPosterHeartbeatModel.maxSwing();

    let anchorPrice = await ReaderPosterHeartbeatModel.pendingAnchors(asset);
    let period;
    if (anchorPrice.eq(Zero)) {
      let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
      anchorPrice = anchor[1];
      period = anchor[0];
    }
    let maxPrice = anchorPrice
      .mul(BASE.add(maxSwing))
      .add(BASE.div(2))
      .div(BASE);
    let minPrice = anchorPrice
      .mul(BASE.sub(maxSwing))
      .add(BASE.div(2))
      .div(BASE);

    if (maxPrice.lt(requestedPrice)) postState.price = maxPrice;

    if (minPrice.gt(requestedPrice)) postState.price = minPrice;

    let timestamp = utils.parseUnits(
      (await getCurrentTime()).toString(),
      "wei"
    );

    // if (price.gt(Zero))
    postState.status = requestedPrice
      .sub(price)
      .abs()
      .mul(BASE)
      .div(price)
      .gte(postSwing);

    // if (postState.status && postState.price.eq(price))
    postState.status =
      postState.status &&
      (!postState.price.eq(price) ||
        (!period.eq(timestamp.div(hour).add(utils.parseUnits("1", "wei"))) &&
          !price.eq(anchorPrice)));

    console.log(`price: ${price.toString()}`);
    console.log(`requestedPrice: ${requestedPrice.toString()}`);
    console.log(`requestedPrice: ${requestedPrice.toString()}`);
    console.log(`postState.price: ${postState.price.toString()}`);
    console.log(`anchorPrice: ${anchorPrice.toString()}`);
    console.log(`period: ${period}`);
    console.log(
      `currentperiod: ${timestamp
        .div(hour)
        .add(utils.parseUnits("1", "wei"))
        .toString()}`
    );
    let heartbeat = await ReaderPosterHeartbeatModel.validInterval(asset);
    if (heartbeat.eq(Zero))
      heartbeat = await ReaderPosterHeartbeatModel.defaultValidInterval();
    let postTime = await ReaderPosterHeartbeatModel.postTime(asset);
    postState.status =
      postState.status ||
      timestamp.add(postBuffer).gte(postTime.add(heartbeat));

    return postState;
  }

  async function timePasses(updateTime: BigNumber) {
    let timestamp = utils.parseUnits(
      (await getCurrentTime()).toString(),
      "wei"
    );
    if (updateTime.gt(timestamp)) {
      let time = Number(updateTime.sub(timestamp).toString());
      await increaseTime(time);
      await increaseBlock(1);
    }
    expect(Number(updateTime.toString())).to.lte(await getCurrentTime());
  }

  async function readyToAnchor(asset: string) {
    let period = (await ReaderPosterHeartbeatModel.anchors(asset))[0];
    let updateTime = period
      .add(utils.parseUnits("1", "wei"))
      .mul(hour)
      .add(utils.parseUnits("1", "wei"));
    await timePasses(updateTime);
  }

  async function priceExpired(asset: string) {
    let heartbeat = await ReaderPosterHeartbeatModel.validInterval(asset);
    if (heartbeat.eq(Zero))
      heartbeat = await ReaderPosterHeartbeatModel.defaultValidInterval();
    let postTime = await ReaderPosterHeartbeatModel.postTime(asset);
    let updateTime = postTime.add(heartbeat);
    await timePasses(updateTime);
  }

  before(async function () {
    await init();
  });

  // _setPrice

  it("test _setPrice: initial price = 0, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = Zero;
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set price > 0, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = utils.parseEther("1");
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set a low price, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = utils.parseEther("0.1");
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set a high price, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = utils.parseEther("10");
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set a normal price, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = utils.parseEther("1.045");
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );
    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );
    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set reader price, success", async () => {
    let asset = USDC.address;
    let reader = BUSD.address;
    await ReaderPosterHeartbeatModel._setReader(asset, reader);

    let requestedPrice = utils.parseEther("2");
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(await ReaderPosterHeartbeatModel.assetPrices(asset)).to.eq(Zero);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: price expired, success", async () => {
    let asset = BUSD.address;
    await priceExpired(asset);

    expect(
      await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(asset)
    ).to.eq(false);

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];

    let requestedPrice =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let postSwing = Zero;
    let postBuffer = Zero;

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.gt(brforePeriod);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);

    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: update anchor, success", async () => {
    let asset = BUSD.address;
    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];
    await readyToAnchor(asset);
    let requestedPrice = brforeAnchorPrice.mul(10);
    let postSwing = Zero;
    let postBuffer = Zero;

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.gt(brforePeriod);
    expect(afterAnchorPrice).to.gt(brforeAnchorPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);

    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set price = 0, success", async () => {
    let asset = BUSD.address;
    let requestedPrice = Zero;
    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.gt(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: set price (pendingAnchor > 0), success", async () => {
    let asset = BUSD.address;
    let requestedPrice = (
      await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset)
    ).mul(10);
    expect(requestedPrice).to.gt(Zero);

    await ReaderPosterHeartbeatModel._setPendingAnchor(asset, requestedPrice);
    expect(await ReaderPosterHeartbeatModel.pendingAnchors(asset)).to.eq(
      requestedPrice
    );

    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterAnchorPrice).to.eq(requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);

    expect(await ReaderPosterHeartbeatModel.pendingAnchors(asset)).to.eq(Zero);
  });

  it("test _setPrice: set price (pendingAnchor = 1), success", async () => {
    let asset = BUSD.address;
    let requestedPrice = BASE;

    await ReaderPosterHeartbeatModel._setPendingAnchor(asset, requestedPrice);
    expect(await ReaderPosterHeartbeatModel.pendingAnchors(asset)).to.eq(
      requestedPrice
    );

    let postSwing = Zero;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let period = anchor[0];
    let anchorPrice = anchor[1];

    expect(anchorPrice).to.eq(requestedPrice);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);

    expect(await ReaderPosterHeartbeatModel.pendingAnchors(asset)).to.eq(Zero);
  });

  it("test _setPrice: requestedPrice / price = 1 + postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.add(price.mul(postSwing).div(BASE));
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price = 1 - postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.sub(price.mul(postSwing).div(BASE));
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price > 1 + postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.add(
      price.mul(postSwing.add(utils.parseEther("0.01"))).div(BASE)
    );
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price > 1 - postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.sub(
      price.mul(postSwing.add(utils.parseEther("0.01"))).div(BASE)
    );
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price < 1 + postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.add(
      price.mul(postSwing.sub(utils.parseEther("0.01"))).div(BASE)
    );
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(false);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price < 1 - postSwing, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.sub(
      price.mul(postSwing.sub(utils.parseEther("0.01"))).div(BASE)
    );
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(false);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: postSwing > 0, swing = 0, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price;
    let postBuffer = utils.parseUnits("300", "wei");

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(false);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: requestedPrice / price = 1 + postSwing, result price = price, success", async () => {
    let asset = BUSD.address;
    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );

    await ReaderPosterHeartbeatModel._setPrice(asset, price.mul(10));

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);

    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.mul(10);
    let postBuffer = utils.parseUnits("300", "wei");

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(false);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.eq(brforePeriod);
    expect(afterAnchorPrice).to.eq(brforeAnchorPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.not.equal(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: postSwing > 0, requestedPrice = price, not update anchor, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.mul(10);
    let postBuffer = utils.parseUnits("300", "wei");

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(false);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.eq(brforePeriod);
    expect(afterAnchorPrice).to.eq(brforeAnchorPrice);
    expect(price).to.eq(postState.price);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: postSwing > 0, requestedPrice = price, update anchor, success", async () => {
    let asset = BUSD.address;

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price.mul(10);
    let postBuffer = utils.parseUnits("300", "wei");

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];

    await readyToAnchor(asset);
    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.gt(brforePeriod);
    expect(afterAnchorPrice).to.gt(brforeAnchorPrice);
    expect(afterAnchorPrice).to.eq(postState.price);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
  });

  it("test _setPrice: postSwing > 0, swing = 0, price expired, success", async () => {
    let asset = BUSD.address;
    await ReaderPosterHeartbeatModel._setAssetValidInterval(
      asset,
      utils.parseUnits("60", "wei")
    );
    await priceExpired(asset);

    let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
      asset
    );
    let postSwing = utils.parseEther("0.05");
    let requestedPrice = price;
    let postBuffer = utils.parseUnits("300", "wei");

    let anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let brforePeriod = anchor[0];
    let brforeAnchorPrice = anchor[1];

    let postState: PostState = await readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
      asset,
      requestedPrice,
      postSwing,
      postBuffer
    );

    expect(postStatus).to.eq(true);
    expect(postStatus).to.eq(postState.status);

    await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

    anchor = await ReaderPosterHeartbeatModel.anchors(asset);
    let afterPeriod = anchor[0];
    let afterAnchorPrice = anchor[1];

    expect(afterPeriod).to.eq(brforePeriod);
    expect(afterAnchorPrice).to.eq(brforeAnchorPrice);

    price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
    let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
      asset
    );
    let priceData =
      await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(asset);
    expect(postStatus).to.eq(postState.status);
    expect(price).to.eq(requestedPrice);
    expect(price).to.eq(postState.price);
    expect(priceData[0]).to.eq(postState.price);
    expect(status).to.eq(true);
    expect(priceData[1]).to.eq(true);
    await ReaderPosterHeartbeatModel._setAssetValidInterval(asset, Zero);
  });

  describe("Random price feed", async () => {
    function randomNum(minNum: number, maxNum: number) {
      switch (arguments.length) {
        case 1:
          return parseInt((Math.random() * minNum + 1).toString(), 10);
          break;
        case 2:
          return parseInt(
            (Math.random() * (maxNum - minNum + 1) + minNum).toString(),
            10
          );
          break;
        default:
          return 0;
          break;
      }
    }
    let times = 0;
    for (let index = 0; index < times; index++) {
      it(`test Random: ${index + 1}`, async () => {
        let asset = BUSD.address;
        // let requestedPrice = utils.parseEther(
        //   (randomNum(0, 20) / 10).toString()
        // );
        let requestedPrice =
          await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset);
        requestedPrice = requestedPrice.add(
          utils
            .parseEther((randomNum(50, 50) / 1000).toString())
            .mul(requestedPrice)
            .div(BASE)
        );

        switch (randomNum(1, 5)) {
          case 1:
            console.log("readyToAnchor");
            await readyToAnchor(asset);
            break;
          case 2:
            console.log("priceExpired");
            await priceExpired(asset);
            break;
          case 3:
            // if (randomNum(0, 1) == 0) {
            //   console.log("_setPendingAnchor up");
            //   requestedPrice = (
            //     await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset)
            //   ).mul(randomNum(2, 10));
            // } else {
            //   console.log("_setPendingAnchor down");
            //   requestedPrice = (
            //     await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(asset)
            //   ).div(randomNum(2, 10));
            // }
            // await ReaderPosterHeartbeatModel._setPendingAnchor(
            //   asset,
            //   requestedPrice
            // );
            break;
          default:
            break;
        }

        let postSwing = utils.parseEther(
          (randomNum(500, 1000) / 10000).toString()
        );
        let postBuffer = utils.parseUnits(randomNum(1, 1800).toString(), "wei");
        let postState: PostState = await readyToUpdate(
          asset,
          requestedPrice,
          postSwing,
          postBuffer
        );

        let postStatus = await ReaderPosterHeartbeatModel.readyToUpdate(
          asset,
          requestedPrice,
          postSwing,
          postBuffer
        );

        await ReaderPosterHeartbeatModel._setPrice(asset, requestedPrice);

        let price = await ReaderPosterHeartbeatModel.callStatic.getAssetPrice(
          asset
        );
        let status = await ReaderPosterHeartbeatModel.callStatic.getAssetStatus(
          asset
        );
        let priceData =
          await ReaderPosterHeartbeatModel.callStatic.getAssetPriceStatus(
            asset
          );
        console.log(postState.status);
        console.log(postStatus);
        expect(postStatus).to.eq(postState.status);
        expect(price).to.eq(postState.price);
        expect(priceData[0]).to.eq(postState.price);
        expect(status).to.eq(true);
        expect(priceData[1]).to.eq(true);
      });
    }
  });
});
