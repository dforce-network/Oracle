import { run, getSignatureData } from "./helpers/utils";
import { deployContracts } from "./helpers/deploy";
import { deployInfo, network } from "./config/config";

let task = { name: "Oracle" };

async function checkAssetPriceModel(asset) {
  return (
    (await task.contracts.Oracle.priceModel(asset.address)) !=
    task.deployments[asset.priceModel].address
  );
}

async function checkPrice(asset) {
  if (asset.hasOwnProperty("price")) {
    return (
      (
        await task.contracts.Oracle.callStatic.getUnderlyingPrice(asset.address)
      ).toString() != asset.price.toString() &&
      (
        await task.contracts[asset.priceModel].callStatic.getAssetPrice(
          asset.address
        )
      ).toString() != asset.price.toString()
    );
  }
  return false;
}

async function checkAggregator(asset) {
  if (asset.hasOwnProperty("aggregator")) {
    return (
      (await task.contracts[asset.priceModel].aggregator(asset.address)) !=
      asset.aggregator
    );
  }
  return false;
}
async function checkHeartbeat(asset) {
  if (asset.hasOwnProperty("heartbeat")) {
    return (
      (
        await task.contracts[asset.priceModel].validInterval(asset.address)
      ).toString() != asset.heartbeat.toString() &&
      (
        await task.contracts[asset.priceModel].defaultValidInterval()
      ).toString() != asset.heartbeat.toString()
    );
  }
  return false;
}

async function checkReader(asset) {
  if (asset.hasOwnProperty("reader")) {
    return (
      (await task.contracts[asset.priceModel].reader(asset.address))[0] !=
      asset.reader
    );
  }
  return false;
}

async function setAssets() {
  const abi = ethers.utils.defaultAbiCoder;
  let info = deployInfo[network[task.chainId]];

  let assetPriceModel = {
    assets: [],
    priceModels: [],
  };

  await Promise.all(
    Object.values(info.assets).map(async (asset) => {
      if (await checkAssetPriceModel(asset)) {
        assetPriceModel.assets.push(asset.address);
        assetPriceModel.priceModels.push(
          task.deployments[asset.priceModel].address
        );
      }
    })
  );

  if (assetPriceModel.assets.length > 0) {
    console.log(`Set the price model of asset\n`);
    await task.contracts.Oracle._setAssetPriceModelBatch(
      assetPriceModel.assets,
      assetPriceModel.priceModels
    );
  }

  let assets = [];
  let signatures = [];
  let calldatas = [];
  await Promise.all(
    Object.values(info.assets).map(async (asset) => {
      if (await checkPrice(asset)) {
        assets.push(asset.address);
        signatures.push("_setPrice(address,uint256)");
        calldatas.push(
          abi.encode(["address", "uint256"], [asset.address, asset.price])
        );
      }

      if (await checkAggregator(asset)) {
        assets.push(asset.address);
        signatures.push("_setAssetAggregator(address,address)");
        calldatas.push(
          abi.encode(["address", "address"], [asset.address, asset.aggregator])
        );
      }

      if (await checkHeartbeat(asset)) {
        assets.push(asset.address);
        signatures.push("_setAssetValidInterval(address,uint256)");
        calldatas.push(
          abi.encode(["address", "uint256"], [asset.address, asset.heartbeat])
        );
      }
      if (await checkReader(asset)) {
        assets.push(asset.address);
        signatures.push("_setReader(address,address)");
        calldatas.push(
          abi.encode(["address", "address"], [asset.address, asset.reader])
        );
      }
    })
  );

  if (assets.length > 0) {
    console.log(`Set asset param\n`);
    const tx = await task.contracts.Oracle._setAssets(
      assets,
      signatures,
      calldatas
    );
    await tx.wait(2);
  }
}

run(task, setAssets);