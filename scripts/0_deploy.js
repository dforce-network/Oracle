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
