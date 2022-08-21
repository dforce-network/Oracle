import { run } from "./helpers/utils";
import { deployContracts } from "./helpers/deploy";
import { deployInfo, network } from "./config/config";

let task = { name: "Oracle" };

async function setOwner() {
  let info = deployInfo[network[task.chainId]];

  let result = [];
  Object.values(info.assets).map((asset) => {
    result.push(asset.priceModel);
  });
  const priceModels = Array.from(new Set(result));
  let pendingModels = [];
  for (let index = 0; index < priceModels.length; index++) {
    const priceModel = priceModels[index];
    const owner = await task.contracts[priceModel].owner();
    const pendingOwner = await task.contracts[priceModel].pendingOwner();
    if (
      pendingOwner == task.deployments.Oracle.address ||
      owner != task.signerAddr
    )
      continue;
    console.log(
      `${priceModel} _setPendingOwner: ${task.deployments.Oracle.address}\n`
    );
    const tx = await task.contracts[priceModel]._setPendingOwner(
      task.deployments.Oracle.address
    );
    await tx.wait(2);
    pendingModels.push(priceModel);
  }

  let targets = [];
  let signatures = [];
  let calldatas = [];
  for (let index = 0; index < pendingModels.length; index++) {
    targets.push(task.deployments[pendingModels[index]].address);
    signatures.push("_acceptOwner()");
    calldatas.push("0x");
  }

  if (targets.length > 0) {
    console.log(`Oracle _acceptOwner\n`);
    const tx = await task.contracts.Oracle._executeTransactions(
      targets,
      signatures,
      calldatas
    );
    await tx.wait(2);
  }
}

run(task, setOwner);
