import { run } from "./helpers/utils";
import { deployContracts } from "./helpers/deploy";
import { deployInfo, network } from "./config/config";

let task = { name: "Oracle" };

async function deploy() {
  let info = deployInfo[network[task.chainId]];

  task.contractsToDeploy = {};
  task.contractsToDeploy.Oracle = {
    contract: "Oracle",
    path: "contracts/",
    useProxy: true,
    getArgs: () => [info.poster],
    initializer: "initialize(address)",
  };

  let result = [];
  Object.values(info.assets).map((asset) => {
    result.push(asset.priceModel);
    if (asset.hasOwnProperty("aggregatorModel")) {
      const aggregator = asset.aggregatorModel;
      let item = {};
      item.contract = aggregator.model;
      item.path = "contracts/aggregator/";
      item.useProxy = false;
      item.getArgs = () => aggregator.param;
      task.contractsToDeploy[`${aggregator.model}(${aggregator.key})`] = item;
    }
  });
  const priceModels = Array.from(new Set(result));
  for (let index = 0; index < priceModels.length; index++) {
    const priceModel = priceModels[index];
    let item = {};
    item.contract = priceModel;
    item.useProxy = false;
    switch (priceModel.slice(0, 6)) {
      case "Layer2":
        item.path = "contracts/priceModel/layer2/";
        item.getArgs = () => [info.layer2SequencerUptimeFeed];
        break;

      case "PythMo":
        item.path = "contracts/priceModel/";
        item.getArgs = () => [info.pyth];
        break;

      case "OKXX1M":
        item.path = "contracts/priceModel/";
        item.getArgs = () => [info.oracle, info.dataSource];
        break;

      default:
        item.path = "contracts/priceModel/";
        item.getArgs = () => [];
        break;
    }
    task.contractsToDeploy[priceModel] = item;
  }
  await deployContracts(task);
}

run(task, deploy);
