import { run, getSignatureData } from "./helpers/utils";
import { deployContracts } from "./helpers/deploy";
import { deployInfo, network } from "./config/config";
import { printArgs } from "./helpers/timelock";

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
  if (asset.hasOwnProperty("aggregatorModel")) {
    const aggregator = asset.aggregatorModel;
    return (
      (await task.contracts[asset.priceModel].aggregator(asset.address)) !=
      task.deployments[`${aggregator.model}(${aggregator.key})`].address
    );
  }
  return false;
}
async function checkHeartbeat(asset) {
  if (asset.hasOwnProperty("heartbeat")) {
    const assetHeartbeat = await task.contracts[asset.priceModel].validInterval(
      asset.address
    );
    if (assetHeartbeat.eq(ethers.utils.parseEther("0")))
      return (
        (
          await task.contracts[asset.priceModel].defaultValidInterval()
        ).toString() != asset.heartbeat.toString()
      );
    return assetHeartbeat.toString() != asset.heartbeat.toString();
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

async function checkPythFeedID(asset) {
  if (asset.hasOwnProperty("feedID")) {
    return (
      (await task.contracts[asset.priceModel].feedID(asset.address)) !=
      asset.feedID
    );
  }
  return false;
}

async function checkX1Key(asset) {
  if (asset.hasOwnProperty("key")) {
    return (
      (await task.contracts[asset.priceModel].priceConfig(asset.address).key) !=
      asset.key
    );
  }
  return false;
}

async function checkExchangeRate(asset) {
  if (asset.hasOwnProperty("exchangeRate")) {
    return (
      (await task.contracts[asset.priceModel].exchangeRate(asset.address)) !=
      asset.exchangeRate.toString()
    );
  }
  return false;
}

async function checkUniV2Pair(asset) {
  if (asset.priceModel == "UniV2Model" && asset.hasOwnProperty("pair")) {
    return (
      (await task.contracts[asset.priceModel].pair(asset.address)) != asset.pair
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
    if (
      (await task.contracts.Oracle.owner()) == task.contracts.timeLock.address
    ) {
      const transactions = [
        [
          "Oracle",
          "_setAssetPriceModelBatch",
          [assetPriceModel.assets, assetPriceModel.priceModels],
        ],
      ];

      await printArgs(task, transactions);
    } else {
      const tx = await task.contracts.Oracle._setAssetPriceModelBatch(
        assetPriceModel.assets,
        assetPriceModel.priceModels
      );
      await tx.wait(2);
    }
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
        let aggregator = asset.hasOwnProperty("aggregator")
          ? asset.aggregator
          : task.deployments[
              `${asset.aggregatorModel.model}(${asset.aggregatorModel.key})`
            ].address;
        calldatas.push(
          abi.encode(["address", "address"], [asset.address, aggregator])
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

      if (await checkPythFeedID(asset)) {
        assets.push(asset.address);
        signatures.push("_setAssetFeedID(address,bytes32)");
        calldatas.push(
          abi.encode(["address", "bytes32"], [asset.address, asset.feedID])
        );
      }

      if (await checkX1Key(asset)) {
        assets.push(asset.address);
        signatures.push("_setAssetPriceConfig(address,string,uint8)");
        calldatas.push(
          abi.encode(
            ["address", "string", "uint8"],
            [asset.address, asset.key, asset.decimals]
          )
        );
      }

      if (await checkExchangeRate(asset)) {
        assets.push(asset.address);
        signatures.push("_setExchangeRate(address,uint256)");
        calldatas.push(
          abi.encode(
            ["address", "uint256"],
            [asset.address, asset.exchangeRate]
          )
        );
      }

      if (await checkUniV2Pair(asset)) {
        assets.push(asset.address);
        signatures.push("_setAssetPair(address,address)");
        calldatas.push(
          abi.encode(["address", "address"], [asset.address, asset.pair])
        );
      }

      if (asset.priceModel == "UniV2TwapModel") {
        const data = await task.contracts[asset.priceModel].assetData(
          asset.address
        );
        let twapDuration = data._twapDuration;

        if (
          asset.hasOwnProperty("uniV2pair") &&
          asset.uniV2pair != data._pair
        ) {
          twapDuration = await task.contracts[
            asset.priceModel
          ].defaultDuration();

          assets.push(asset.address);
          signatures.push("_setAssetPair(address,address)");
          calldatas.push(
            abi.encode(["address", "address"], [asset.address, asset.uniV2pair])
          );
        }

        if (
          asset.hasOwnProperty("twapDuration") &&
          asset.twapDuration.toString() != twapDuration.toString()
        ) {
          assets.push(asset.address);
          signatures.push("_setAssetTwapDuration(address,uint256)");
          calldatas.push(
            abi.encode(
              ["address", "uint256"],
              [asset.address, asset.twapDuration]
            )
          );
        }
      }
    })
  );

  if (assets.length > 0) {
    console.log(`Set asset param\n`);
    if (
      (await task.contracts.Oracle.owner()) == task.contracts.timeLock.address
    ) {
      const transactions = [
        ["Oracle", "_setAssets", [assets, signatures, calldatas]],
      ];

      await printArgs(task, transactions);
    } else {
      const tx = await task.contracts.Oracle._setAssets(
        assets,
        signatures,
        calldatas
      );
      await tx.wait(2);
    }
  }
}

run(task, setAssets);
