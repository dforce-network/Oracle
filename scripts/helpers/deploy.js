import {
  deployContractInternal,
  deployProxy,
  attachContractAtAdddress,
} from "./contract";

function checkArgs(args) {
  if (args.includes(undefined)) {
    throw "Some argument is undefined";
  }
}

async function deployContract(
  contracts,
  deployments,
  signer,
  name,
  { contract, path, useProxy, getArgs, initializer }
) {
  if (deployments.hasOwnProperty(name)) {
    console.log(name, "Already deployed");
    return;
  }

  console.log("\n------------------------------------");
  console.log(`Going to deploy ${name}`);

  const args = getArgs(deployments);

  checkArgs(args);

  // console.log("args:", args);

  let contractInstance;
  if (useProxy) {
    const implementation = contract + "Impl";

    if (!deployments[implementation]) {
      console.log(`Going to deploy ${implementation}`);

      // TODO: Need to hanle implementation's contrustor args

      const implementationInstance = await deployContractInternal(
        signer,
        contract,
        path,
        args
      );

      console.log(`Going to initialize ${implementation}`);

      // await implementationInstance.initialize(...args);

      deployments[implementation] = {
        contract: contract,
        path: path,
        address: implementationInstance.address,
      };
    }

    console.log(`Going to deploy the ${name} proxy`);

    const proxy = await deployProxy(
      signer,
      contract,
      path,
      deployments["proxyAdmin"].address,
      deployments[implementation].address,
      args,
      initializer
    );

    contractInstance = await attachContractAtAdddress(
      signer,
      proxy.address,
      contract,
      path
    );
  } else {
    contractInstance = await deployContractInternal(
      signer,
      contract,
      path,
      args
    );
  }

  console.log(`${name} deployed at ${contractInstance.address}`);

  contracts[name] = contractInstance;
  deployments[name] = {
    contract: contract,
    path: path,
    address: contractInstance.address,
  };
}

export async function deployContracts(task) {
  for (const [key, config] of Object.entries(task.contractsToDeploy)) {
    await deployContract(
      task.contracts,
      task.deployments,
      task.signer,
      key,
      config
    );
  }
}
