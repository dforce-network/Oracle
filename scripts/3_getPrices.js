import { run } from "./helpers/utils";
import { deployInfo, network } from "./config/config";

let task = { name: "Oracle" };

async function getAssetPrice() {
  for (const [key, asset] of Object.entries(
    deployInfo[network[task.chainId]].assets
  )) {
    const [price, status] =
      await task.contracts.Oracle.callStatic.getUnderlyingPriceAndStatus(
        asset.address
      );
    const assetPrice =
      await task.contracts.Oracle.callStatic.getUnderlyingPrice(asset.address);

    const priceString = price.toString();
    console.log(`${key} \t: ${assetPrice.toString()}`);
    console.log(`${key} \t: ${status} ${priceString} `);
  }
}

run(task, getAssetPrice);
