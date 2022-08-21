import { init, finalize } from "./context";

export function getProvider() {
  let provider;
  if (typeof remix == "object") {
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
  } else {
    provider = ethers.provider;
  }

  return provider;
}

export async function loadJSON(file) {
  let json;

  try {
    if (typeof remix == "object") {
      json = await remix.call("fileManager", "getFile", file);
    } else {
      json = require("fs").readFileSync(file);
    }
  } catch (e) {
    console.log(`${file} open failed`);
    json = "{}";
  }

  return JSON.parse(json);
}

export async function saveJSON(file, json) {
  try {
    if (typeof remix == "object") {
      await remix.call(
        "fileManager",
        "writeFile",
        file,
        JSON.stringify(json, null, 2)
      );
    } else {
      const fs = require("fs");
      if (!fs.existsSync(file)) {
        const path = require("path");
        fs.mkdirSync(path.dirname(file), { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(json, null, 2));
    }

    console.log(`${file} saved`);
  } catch (e) {
    console.log(`Save ${file} failed`, e);
  }
}

export async function getNextDeployAddress(signer) {
  const from = await signer.getAddress();
  const nonce = (await signer.getTransactionCount()) + 1;
  // console.log('Deployer next nonce is: ', nonce)
  const addressOfNextDeployedContract = ethers.utils.getContractAddress({
    from,
    nonce,
  });
  // console.log('Next deploy contract address is: ', addressOfNextDeployedContract)

  return addressOfNextDeployedContract;
}

export async function run(task, func) {
  try {
    await init(task);
    await func(task);
    await finalize(task);
    console.log(`Task ${task.name} Finished`);
  } catch (error) {
    console.error(error);
    finalize(task);
  }
}

export async function getSignatureAndData(contract, method, args) {
  const target = contract.address;
  const value = 0;

  let signature;
  let calldata;
  if (ethers.version[0] == 4) {
    signature = contract.interface.functions[method].signature;
    const data = contract.interface.functions[method].encode(args);
    calldata = "0x" + data.substr(10);
  } else {
    const tx = await contract.populateTransaction[method](...args);
    signature = contract.interface.parseTransaction(tx).signature;
    calldata = "0x" + tx.data.substr(10);
  }

  return { target, value, signature, calldata };
}

export async function getSignatureData(contract, method, args) {
  // let signature;
  let calldata;
  if (ethers.version[0] == 4) {
    // signature = contract.interface.functions[method].signature;
    calldata = contract.interface.functions[method].encode(args);
  } else {
    const tx = await contract.populateTransaction[method](...args);
    // signature = contract.interface.parseTransaction(tx).signature;
    calldata = tx.data;
  }

  return calldata;
}
