import { ethers, waffle } from "hardhat";
import { Contract } from "ethers";
import { getCallData } from "./helper";

// Use ethers provider instead of waffle's default MockProvider
export const loadFixture = waffle.createFixtureLoader([], waffle.provider);

export async function deployContract(contractName: string, args: any[]) {
  const contract = await ethers.getContractFactory(contractName);
  const deployed = await contract.deploy(...args);
  await deployed.deployed();
  return deployed;
}

export async function instantiateContract(contractName: string, address: any) {
  const contract = await ethers.getContractFactory(contractName);
  return contract.attach(address);
}

export async function fixtureDefault() {
  // Get all accounts
  const [owner, poster, ...accounts] = await ethers.getSigners();
  const posterAddress = await poster.getAddress();

  // Deploy proxy admin contract
  const ProxyAdmin = await deployContract("ProxyAdmin", []);

  // Deploy mock contract
  const MockSequencer: Contract = await deployContract("MockSequencer", []);
  const MockSequencerUptimeFeed: Contract = await deployContract(
    "MockSequencerUptimeFeed",
    []
  );
  // Deploy Oracle contract
  const Oracle: Contract = await deployContract("Oracle", [posterAddress]);

  // Deploy Poster priceModel contract
  const PosterModel: Contract = await deployContract("PosterModel", []);
  const ReaderPosterModel: Contract = await deployContract(
    "ReaderPosterModel",
    []
  );
  const PosterHeartbeatModel: Contract = await deployContract(
    "PosterHeartbeatModel",
    []
  );
  const ReaderPosterHeartbeatModel: Contract = await deployContract(
    "ReaderPosterHeartbeatModel",
    []
  );

  // Deploy Chainlink priceModel contract
  const ChainlinkModel: Contract = await deployContract("ChainlinkModel", []);
  const ChainlinkHeartbeatModel: Contract = await deployContract(
    "ChainlinkHeartbeatModel",
    []
  );
  // const ChainlinkStocksModel: Contract = await deployContract("ChainlinkStocksModel", []);

  // Deploy layer2 priceModel contract
  const Layer2PosterModel: Contract = await deployContract(
    "Layer2PosterModel",
    [MockSequencerUptimeFeed.address]
  );
  const Layer2PosterHeartbeatModel: Contract = await deployContract(
    "Layer2PosterHeartbeatModel",
    [MockSequencerUptimeFeed.address]
  );
  const Layer2ReaderPosterHeartbeatModel: Contract = await deployContract(
    "Layer2ReaderPosterHeartbeatModel",
    [MockSequencerUptimeFeed.address]
  );

  const Layer2ChainlinkModel: Contract = await deployContract(
    "Layer2ChainlinkModel",
    [MockSequencerUptimeFeed.address]
  );
  const Layer2ChainlinkHeartbeatModel: Contract = await deployContract(
    "Layer2ChainlinkHeartbeatModel",
    [MockSequencerUptimeFeed.address]
  );
  // const Layer2ChainlinkStocksModel: Contract = await deployContract("Layer2ChainlinkStocksModel", [MockSequencerUptimeFeed.address]);

  const WBTC: Contract = await deployContract("MockERC20", ["WBTC", "WBTC", 8]);
  const USDC: Contract = await deployContract("MockERC20", ["USDC", "USDC", 6]);
  const BUSD: Contract = await deployContract("MockERC20", [
    "BUSD",
    "BUSD",
    18,
  ]);

  return {
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
  };
}
