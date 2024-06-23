export const network = {
  1: "mainnet",
  56: "bsc",
  42161: "arbitrum",
  10: "optimism",
  8453: "base",
  137: "polygon",
  43114: "avalanche",
  2222: "kava",
  421611: "arbitrumRinkeby",
  71: "confluxTestnet",
  1030: "confluxeSpace",
  280: "zkSyncTestnet",
  324: "zkSyncEra",
  59140: "lineaTestnet",
  534353: "scrollAlphaTestnet",
  5: "goerli",
  195: "OKXX1Testnet",
  11155111: "sepolia",
  17000: "holesky",
  421614: "arbitrumSepolia",
};
export const deployInfo = {
  mainnet: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    assets: {
      iETH: {
        address: "0x5ACD75f21659a59fFaB9AEBAf350351a8bfaAbc0",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iWBTC: {
        address: "0x5812fCF91adc502a765E5707eBB3F36a07f63c02",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC
        // aggregatorModel: {
        //   model: "TransitAggregator",
        //   key: "WBTC",
        //   param: [
        //     "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23", // WBTC/BTC
        //     "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // BTC
        //   ],
        // },
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0x2f956b2f801c6dad74E87E7f45c94f6283BF0f45",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0x1180c114f7fAdCB6957670432a3Cf8Ef08Ab5354",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iCRV: {
        address: "0xe39672DFa87C824BcB3b38aA480ef684687CBC09",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iEUX: {
        address: "0x44c324970e5CbC5D4C3F3B7604CbC6640C2dcFbF",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xb49f677943BC038e9857d61E7d053CaA2C1734C1",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iDAI: {
        address: "0x298f243aD592b6027d4717fBe9DeCda668E3c3A8",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      isDAI: {
        address: "0x5f02fb5f1203a502c701a12Fd409548993F795ba",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xf9B434C01D3860bb329fdD2353a3f99543C2e0d2",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iHBTC: {
        address: "0x47566acD7af49D2a192132314826ed3c3c5f3698",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iwstETH: {
        address: "0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9",
        priceModel: "ChainlinkHeartbeatModel",
        aggregatorModel: {
          // model: "TransitAggregator",
          // key: "wstETH",
          // param: [
          //   "0x86392dC19c0b719886221c78AB11eb8Cf5c52812",
          //   "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
          // ],
          model: "WstETHTransitAggregator",
          key: "wstETH",
          param: [
            "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
            "0x86392dC19c0b719886221c78AB11eb8Cf5c52812", // STETH/ETH
            "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      irenFIL: {
        address: "0x59055220e00da46C891283EA1d79363c769158b9",
        priceModel: "ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "renFIL",
          param: [
            "0x0606Be69451B1C9861Ac6b3626b99093b713E801",
            "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iFEI: {
        address: "0x47C19A2ab52DA26551A22e2b2aEED5d19eF4022F",
        // priceModel: "ChainlinkHeartbeatModel",
        // aggregator: "0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9",
        // heartbeat: ethers.utils.parseUnits("7200", "wei"),
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iGOLDx: {
        address: "0x164315EA59169D46359baa4BcC6479bB421764b6",
        priceModel: "ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "UnitTransitAggregator",
          key: "GOLDx",
          param: [
            "0x9B97304EA12EFed0FAd976FBeCAad46016bf269e",
            "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUNI: {
        address: "0xbeC9A824D6dA8d0F923FD9fbec4FAA949d396320",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iAAVE: {
        address: "0x3e5CB932D7A1c0ca096b71Cc486b2aD7e0DC3D0e",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iFRAX: {
        address: "0x71173e3c6999c2C72ccf363f4Ae7b67BCc7E8F63",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iBUSD: {
        address: "0x24677e213DeC0Ea53a430404cF4A11a6dc889FCe",
        // priceModel: "ChainlinkHeartbeatModel",
        // aggregator: "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },

      iMKR: {
        address: "0x039E7Ef6a674f3EC1D88829B8215ED45385c24bc",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xec1D1B3b0443256cc3860e24a46F108e699484Aa",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iTUSD: {
        address: "0x6E6a689a5964083dFf9FD7A0f788BAF620ea2DBe",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xec746eCF986E2927Abd291a2A1716c940100f8Ba",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iLINK: {
        address: "0xA3068AA78611eD29d381E640bb2c02abcf3ca7DE",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      ixBTC: {
        address: "0x4013e6754634ca99aF31b5717Fa803714fA07B35",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      ixETH: {
        address: "0x237C69E082A94d37EBdc92a84b58455872e425d6",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMxETH: {
        address: "0x028DB7A9d133301bD49f27b5E41F83F56aB0FaA6",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMEUX: {
        address: "0x591595Bfae3f5d51A820ECd20A1e3FBb6638f34B",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xb49f677943BC038e9857d61E7d053CaA2C1734C1",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iMxBTC: {
        address: "0xfa2e831c674B61475C175B2206e81A5938B298Dd",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSX: {
        address: "0x1AdC34Af68e970a93062b67344269fD341979eb0",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iMUSX: {
        address: "0xd1254d280e7504836e1B0E36535eBFf248483cEE",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iDF: {
        address: "0xb3dc7425e63E1855Eb41107134D471DD34d7b239",
        priceModel: "ReaderPosterHeartbeatModel",
        heartbeat: ethers.utils.parseUnits("608400", "wei"),
      },
      DF: {
        address: "0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0",
        priceModel: "ReaderPosterHeartbeatModel",
        reader: "0xb3dc7425e63E1855Eb41107134D471DD34d7b239",
      },

      irETH: {
        address: "0x33b5EdC15E05D3daC27fCCAd77cf550C5f3f02AA",
        priceModel: "ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "rETH",
          param: [
            "0x536218f9E9Eb48863970252233c8F271f554C2d0", // rETH/ETH
            "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
    },
  },
  bsc: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    assets: {
      iBNB: {
        address: "0xd57E1425837567F74A35d07669B23Bfb67aA4A93",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iXTZ: {
        address: "0x8be8cd81737b282C909F1911f3f0AdE630c335AA",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x9A18137ADCF7b05f033ad26968Ed5a9cf0Bf8E6b",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },

      iGOLDx: {
        address: "0xc35ACAeEdB814F42B2214378d8950F8555B2D670",
        priceModel: "ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "UnitAggregator",
          key: "GOLDx",
          param: ["0x7F8caD4690A38aC28BDA3D132eF83DB1C17557Df"],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iFIL: {
        address: "0xD739A569Ec254d6a20eCF029F024816bE58Fb810",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xE5dbFD9003bFf9dF5feB2f4F445Ca00fb121fb83",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iBTC: {
        address: "0x0b66A250Dadf3237DdB38d485082a7BfE400356e",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iADA: {
        address: "0xFc5Bb1E8C29B100Ef8F12773f972477BCab68862",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xa767f745331D267c7751297D982b050c93985627",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iETH: {
        address: "0x390bf37355e9dF6Ea2e16eEd5686886Da6F47669",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iBCH: {
        address: "0x9747e26c5Ad01D3594eA49ccF00790F564193c15",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x43d80f616DAf0b0B42a928EeD32147dC59027D41",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUNI: {
        address: "0xee9099C1318cf960651b3196747640EB84B8806b",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xb57f259E7C24e56a1dA00F66b55A5640d9f9E7e4",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iEUX: {
        address: "0x983A727Aa3491AB251780A13acb5e876D3f2B1d8",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x0bf79F617988C472DcA68ff41eFe1338955b9A80",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iATOM: {
        address: "0x55012aD2f0A50195aEF44f403536DF2465009Ef7",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xb056B7C804297279A9a673289264c17E6Dc6055d",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iCAKE: {
        address: "0xeFae8F7AF4BaDa590d4E707D900258fc72194d73",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      ixBTC: {
        address: "0x219B850993Ade4F44E24E6cac403a9a40F1d3d2E",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0xAF9c10b341f55465E8785F0F81DBB52a9Bfe005d",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x51597f405303C4377E36123cBc172b13269EA163",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDT: {
        address: "0x0BF8C72d618B5d46b055165e21d661400008fa0F",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iBUSD: {
        address: "0x5511b64Ae77452C7130670C79298DEC978204a47",
        // priceModel: "ChainlinkHeartbeatModel",
        // aggregator: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
        // heartbeat: ethers.utils.parseUnits("7200", "wei"),
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },

      iLINK: {
        address: "0x50E894894809F642de1E11B4076451734c963087",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iDOT: {
        address: "0x9ab060ba568B86848bF19577226184db6192725b",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xC333eb0086309a16aa7c8308DfD32c8BBA0a2592",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iXRP: {
        address: "0x6D64eFfe3af8697336Fc57efD5A7517Ad526Dd6d",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x93A67D414896A280bF8FFB3b389fE3686E014fda",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      ixETH: {
        address: "0xF649E651afE5F05ae5bA493fa34f44dFeadFE05d",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iLTC: {
        address: "0xd957BEa67aaDb8a72061ce94D033C631D1C1E6aC",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x74E72F37A8c415c8f1a98Ed42E78Ff997435791D",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iDAI: {
        address: "0xAD5Ec11426970c32dA48f58c92b1039bC50e5492",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMEUX: {
        address: "0xb22eF996C0A2D262a19db2a66A256067f51511Eb",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x0bf79F617988C472DcA68ff41eFe1338955b9A80",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMxBTC: {
        address: "0x6E42423e1bcB6A093A58E203b5eB6E8A8023b4e5",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMxETH: {
        address: "0x6AC0a0B3959C1e5fcBd09b59b09AbF7C53C72346",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSX: {
        address: "0x7B933e1c1F44bE9Fb111d87501bAADA7C8518aBe",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iMUSX: {
        address: "0x36f4C36D1F6e8418Ecb2402F896B2A8fEDdE0991",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iDF: {
        address: "0xeC3FD540A2dEE6F479bE539D64da593a59e12D08",
        priceModel: "ReaderPosterHeartbeatModel",
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        heartbeat: ethers.utils.parseUnits("262800", "wei"),
      },
      DF: {
        address: "0x4A9A2b2b04549C3927dd2c9668A5eF3fCA473623",
        priceModel: "ReaderPosterHeartbeatModel",
        reader: "0xeC3FD540A2dEE6F479bE539D64da593a59e12D08",
      },
    },
  },
  arbitrum: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    layer2SequencerUptimeFeed: "0xFdB631F5EE196F0ed6FAa767959853A9F217697D",
    assets: {
      iETH: {
        address: "0xEe338313f022caee84034253174FA562495dcC15",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iWBTC: {
        address: "0xD3204E4189BEcD9cD957046A8e4A643437eE0aCC",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x6ce185860a4963106506C203335A2910413708e9", // BTC
        // aggregator: "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57", // WBTC
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUNI: {
        address: "0x46Eca1482fffb61934C4abCA62AbEB0b12FEb17A",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iLINK: {
        address: "0x013ee4934ecbFA5723933c4B08EA5E47449802C8",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iAAVE: {
        address: "0x7702dC73e8f8D9aE95CF50933aDbEE68e9F1D725",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xaD1d5344AaDE45F43E596773Bcc4c423EAbdD034",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iCRV: {
        address: "0x662da37F0B992F58eF0d9b482dA313a3AB639C0D",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iDAI: {
        address: "0xf6995955e4B0E5b287693c221f456951D612b628",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDC: {
        address: "0x8dc3312c68125a94916d62B97bb5D925f84d4aE0",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDCn: {
        address: "0x70284c0C2dFa98a972c5c8cbE32a0b7f90b3B578",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0xf52f079Af080C9FB5AFCA57DDE0f8B83d49692a9",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iFRAX: {
        address: "0xb3ab7148cCCAf66686AD6C1bE24D83e58E6a504e",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iARB: {
        address: "0xD037c36dbc81a8890728D850E080e38F6EeB95EF",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iEUX: {
        address: "0x5675546Eb94c2c256e6d7c3F7DcAB59bEa3B0B8B",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xA14d53bC1F1c0F31B4aA3BD109344E5009051a84",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iMEUX: {
        address: "0x5BE49B2e04aC55A17c72aC37E3a85D9602322021",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xA14d53bC1F1c0F31B4aA3BD109344E5009051a84",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSX: {
        address: "0x0385F851060c09A552F1A28Ea3f612660256cBAA",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iMUSX: {
        address: "0xe8c85B60Cb3bA32369c699015621813fb2fEA56c",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iDF: {
        address: "0xaEa8e2e7C97C5B7Cd545d3b152F669bAE29C4a63",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        // heartbeat: ethers.utils.parseUnits("3600", "wei"), // test
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        heartbeat: ethers.utils.parseUnits("262800", "wei"),
      },
      DF: {
        address: "0xaE6aab43C4f3E0cea4Ab83752C278f8dEbabA689",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        reader: "0xaEa8e2e7C97C5B7Cd545d3b152F669bAE29C4a63",
      },
      iwstETH: {
        address: "0xa8bAd6CE1937F8e047bcA239Cff1f2224B899b23",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "wstETH",
          param: [
            "0xB1552C5e96B312d0Bf8b554186F846C40614a540", // wstETH/stETH
            "0x07C5b924399cc23c24a95c8743DE4006a32b7f2a", // stETH
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      irETH: {
        address: "0xFD7e2EACAB5Fd983a2189eB6A38c3ee2aD9F69Df",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "rETH",
          param: [
            "0xF3272CAfe65b190e76caAF483db13424a3e23dD2", // rETH/ETH
            "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
    },
  },
  optimism: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    layer2SequencerUptimeFeed: "0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389",
    assets: {
      iETH: {
        address: "0xA7A084538DE04d808f20C785762934Dd5dA7b3B4",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0xB344795f0e7cf65a55cB0DDe1E866D46041A2cc2",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDCn: {
        address: "0x0fD11B5ED5B82Ef454BEe2516D1b23d1b07b6c46",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0x5d05c14D71909F4Fe03E13d486CCA2011148FC44",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      isUSD: {
        address: "0x1f144cD63d7007945292EBCDE14a6Df8628e2Ed7",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x7f99817d87baD03ea21E05112Ca799d715730efe",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iCRV: {
        address: "0xED3c20d047D2c57C3C6DD862C9FDd1b353Aff36f",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xbD92C6c284271c227a1e0bF1786F468b539f51D9",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iLINK: {
        address: "0xDd40BBa0faD6810A7A09e8Ccca9bCe1E48B28Ece",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xCc232dcFAAE6354cE191Bd574108c1aD03f86450",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iDAI: {
        address: "0x5bedE655e2386AbC49E2Cc8303Da6036bF78564c",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x8dBa75e83DA73cc766A7e5a0ee71F656BAb470d6",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iOP: {
        address: "0x7702dC73e8f8D9aE95CF50933aDbEE68e9F1D725",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x0D276FC14719f9292D5C1eA2198673d1f4269246",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iAAVE: {
        address: "0xD65a18dAE68C846297F3038C93deea0B181288d5",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x338ed6787f463394D24813b297401B9F05a8C9d1",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iWBTC: {
        address: "0x24d30216c07Df791750081c8D77C83cc8b06eB27",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593", // BTC
        // aggregator: "0x718A5788b89454aAE3A028AE9c111A29Be6c2a6F", // WBTC
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSX: {
        address: "0x7e7e1d8757b241Aa6791c089314604027544Ce43",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iMUSX: {
        address: "0x94a14Ba6E59f4BE36a77041Ef5590Fe24445876A",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iDF: {
        address: "0x6832364e9538Db15655FA84A497f2927F74A6cE6",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        heartbeat: ethers.utils.parseUnits("262800", "wei"),
      },
      DF: {
        address: "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        reader: "0x6832364e9538Db15655FA84A497f2927F74A6cE6",
      },
      iwstETH: {
        address: "0x4B3488123649E8A671097071A02DA8537fE09A16",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "wstETH",
          param: [
            "0xe59EBa0D492cA53C6f46015EEa00517F2707dc77", // wstETH/stETH
            "0x41878779a388585509657CE5Fb95a80050502186", // stETH
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },

      irETH: {
        address: "0x107d8661C2617B498941AfE8c2FbEa6b6976F71e",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "rETH",
          param: [
            "0x22F3727be377781d1579B7C9222382b21c9d1a8f", // rETH/ETH
            "0x13e3Ee699D1909E989722E753853AE30b17e08c5", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
    },
  },
  base: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    layer2SequencerUptimeFeed: "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433",
    assets: {
      iETH: {
        address: "0x76B5f31A3A6048A437AfD86be6E1a40888Dc8Bba",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iwstETH: {
        address: "0xf8fBD6202FBcfC607E31A99300e6c84C2645902f",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "wstETH",
          param: [
            "0xa669E5272E60f78299F4824495cE01a3923f4380", // wstETH/ETH
            "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      icbETH: {
        address: "0x6D9Ce334C2cc6b80a4cddf9aEA6D3F4683cf4a50",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregatorModel: {
          model: "TransitAggregator",
          key: "cbETH",
          param: [
            "0x868a501e68F3D1E89CfC0D22F6b22E8dabce5F04", // cbETH/ETH
            "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", // ETH/USD
          ],
        },
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDC: {
        address: "0xBb81632e9e1Fb675dB5e5a5ff66f16E822c9a2FD",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSX: {
        address: "0x82AFc965E4E18009DD8d5AF05cfAa99bF0E605df",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
    },
  },
  polygon: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    assets: {
      iMATIC: {
        address: "0x6A3fE5342a4Bd09efcd44AC5B9387475A0678c74",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0x5268b3c4afb0860D365a093C184985FCFcb65234",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iWBTC: {
        address: "0x94a14Ba6E59f4BE36a77041Ef5590Fe24445876A",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xc907E116054Ad103354f2D350FD2514433D57F6f", // BTC
        // aggregator: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6", // WBTC
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iDAI: {
        address: "0xec85F77104Ffa35a5411750d70eDFf8f1496d95b",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iAAVE: {
        address: "0x38D0c498698A35fc52a6EB943E47e4A5471Cd6f9",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x72484B12719E23115761D5DA1646945632979bB6",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iWETH: {
        address: "0x0c92617dF0753Af1CaB2d9Cc6A56173970d81740",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iEUX: {
        address: "0x15962427A9795005c640A6BF7f99c2BA1531aD6d",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iCRV: {
        address: "0x7D86eE431fbAf60E86b5D3133233E478aF691B68",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x336584C8E6Dc19637A5b36206B1c79923111b405",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDT: {
        address: "0xb3ab7148cCCAf66686AD6C1bE24D83e58E6a504e",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSX: {
        address: "0xc171EBE1A2873F042F1dDdd9327D00527CA29882",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iDF: {
        address: "0xcB5D9b6A9BA8eA6FA82660fAA9cC130586F939B2",
        priceModel: "ReaderPosterHeartbeatModel",
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        heartbeat: ethers.utils.parseUnits("262800", "wei"),
      },
      DF: {
        address: "0x08C15FA26E519A78a666D19CE5C646D55047e0a3",
        priceModel: "ReaderPosterHeartbeatModel",
        reader: "0xcB5D9b6A9BA8eA6FA82660fAA9cC130586F939B2",
      },
    },
  },
  avalanche: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    assets: {
      iUSX: {
        address: "0x73C01B355F2147E5FF315680E068354D6344Eb0b",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
    },
  },
  kava: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    assets: {
      iUSX: {
        address: "0x9787aF345E765a3fBf0F881c49f8A6830D94A514",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUSDC: {
        address: "0xe04A00B811896f415640b9d5D40256068F2956e6",
        priceModel: "ReaderPosterModel",
        reader: "0x9787aF345E765a3fBf0F881c49f8A6830D94A514",
      },
      iUSDT: {
        address: "0x4522Ce95a9A2bFd474f91827D68De01Adb4c8b33",
        priceModel: "ReaderPosterModel",
        reader: "0x9787aF345E765a3fBf0F881c49f8A6830D94A514",
      },
    },
  },
  arbitrumRinkeby: {
    poster: "0xF4Db6BB2bd78b42e3cFbA47B667ff8A2CebB570D",
    layer2SequencerUptimeFeed: "0x9912bb73e2aD6aEa14d8D72d5826b8CBE3b6c4E2",
    assets: {
      iMUSX: {
        address: "0x772C6832257Fd0D82D4458A08133BCb977aD30aC",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUSX: {
        address: "0xCCdC7b7aBf6637908FDd11CfBbcee7CdcEDaF2D0",
        priceModel: "Layer2PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iETH: {
        address: "0x4bdEC53C76d646aA2CCC19031950643745baDff5",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iWBTC: {
        address: "0x244D1dCAFec54c514D3864EE65679aF484EEB56d",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iDAI: {
        address: "0x6886D2Caef566ed7287633Ab7092BF7A2aedce76",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x3e3546c6b5689f7EAa1BA7Bc9571322c3168D786",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0x29004915a762CAe795819a7e8a4783E6DF9132a5",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0xe5CF0E045B45C1694393124362224e0B34a241F9",
        priceModel: "Layer2ChainlinkHeartbeatModel",
        aggregator: "0x103a2d37Ea6b3b4dA2F5bb44E001001729E74354",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iDF: {
        address: "0x515482d94b0d45C06532dbcb3443C09c6aB22Ed2",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        price: ethers.utils.parseEther("0.0364"),
      },
      DF: {
        address: "0x261d5E1C34ad02e40D8E2A95A326821288a78718",
        priceModel: "Layer2ReaderPosterHeartbeatModel",
        reader: "0x515482d94b0d45C06532dbcb3443C09c6aB22Ed2",
      },
    },
  },
  confluxTestnet: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    pyth: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    assets: {
      iETH: {
        address: "0x81004bB91c611B646b630426eB8A46f0eBea69F5",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("6000", "wei"),
        feedID:
          "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
      },
      iCFX: {
        address: "0xF77508f5deEc008238C226e074E00455be7B9c74",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xeba2144f04b3af59382d92b8cbc3170008b4a2945a01f36e81f92dfdeb8cc519",
      },
      iUSX: {
        address: "0xC4fF55776eF0dAC86890cA2C1aD7859d5C0Ae3c6",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iWBTC: {
        address: "0xC52953db2C5764aB192C84eCd08508b0A7815E1D",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
      },
      iUSDC: {
        address: "0x95659C4C8110E75459F5C39d12723930A57531B2",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
      },
      iUSDT: {
        address: "0x4B0bFd5465761e111a021826B903Af2435A8C72d",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588",
      },
    },
  },
  confluxeSpace: {
    poster: "0x5c5bFFdB161E637B7f555CC122831126e02270d5",
    pyth: "0xe9d69CdD6Fe41e7B621B4A688C5D1a68cB5c8ADc",
    assets: {
      iWBTC: {
        address: "0xE08020a6517c1AD321D47c45Efbe1d76F5035d75",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      },
      iETH: {
        address: "0x620e8Ed48945d97CBea0B794F50E5e51950EbA24",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      },
      iCFX: {
        address: "0x25CCd7E60550EF32266fA90441BcE2BA742d88bc",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0x8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933",
      },
      iUSDT: {
        address: "0xC80aD49191113d31fe52427c01A197106ef5EB5b",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      },
      iUSDC: {
        address: "0xb88DC5AaE0C26903230ebc9a6fBAb8D511AF9897",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
      },
      iUSX: {
        address: "0x6f87b39a2e36F205706921d81a6861B655db6358",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("1"),
      },
      DF: {
        address: "0x53aa2b7bead41614577ba5b636c482790c5f54c5",
        priceModel: "ReaderPosterHeartbeatModel",
        // heartbeat: ethers.utils.parseUnits("90000", "wei"),
        heartbeat: ethers.utils.parseUnits("262800", "wei"),
      },
    },
  },
  zkSyncTestnet: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    pyth: "0xC38B1dd611889Abc95d4E0a472A667c3671c08DE",
    assets: {
      iETH: {
        address: "0x3C5ab6f2BfBEFDcAd193BDf77c7E9D1F8f133849",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("6000", "wei"),
        feedID:
          "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
      },
      iUSX: {
        address: "0x5bd08d06B68df89Ca47718FDeCD89FfE59d935F9",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iWBTC: {
        address: "0x8049CEa1F8BA92d9626467C09dE684a4a7FC6d82",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
      },
      iUSDC: {
        address: "0x81E4DD580738063214121d8Ec156CE6426CDBb81",
        priceModel: "PythModel",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
        feedID:
          "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
      },
    },
  },
  lineaTestnet: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    assets: {
      iETH: {
        address: "0x1FC94B633F5F25171F86B7b4Ac845e762E3233Bd",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1875.07"),
      },
      iUSX: {
        address: "0xC6d76E0706f3F75a13441Fc66A87D76C17BA6E70",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUSDC: {
        address: "0x9Fd0b6668933f4FBc6b3897506DC70E147dfcf99",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseUnits("1", 30),
      },
      iUSDT: {
        address: "0xF39A9AC259ef0d83A884Bc01f3a993D47b8Aa155",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseUnits("1.001", 30),
      },
    },
  },
  scrollAlphaTestnet: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    assets: {
      iETH: {
        address: "0xD425Ce07D393CF5FF7b709E788a125ac7ffCdd8f",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1636.07"),
      },
      iUSX: {
        address: "0x278149105c5cd6D0CbE84C2E6f59dc20C14a2ab2",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUSDC: {
        address: "0x191397f929dAf294C744b60cD2A0EE11DA9652D9",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseUnits("1", 30),
      },
      iUSDT: {
        address: "0x1FC94B633F5F25171F86B7b4Ac845e762E3233Bd",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseUnits("1.001", 30),
      },
    },
  },
  OKXX1Testnet: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    oracle: "0x64481ebfFe69d688d754e09918e82C89D8Da2507",
    dataSource: "0x6cf2a39d1c85adfb50da183060dc0d46529f3f9c",
    assets: {
      iETH: {
        address: "0xCE1A42eC7d25ceF9468d8A7D00B9C532a4aEB918",
        priceModel: "OKXX1Model",
        key: "ETH",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iBTC: {
        address: "0xD425Ce07D393CF5FF7b709E788a125ac7ffCdd8f",
        priceModel: "OKXX1Model",
        key: "BTC",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iOKB: {
        address: "0x278149105c5cd6D0CbE84C2E6f59dc20C14a2ab2",
        priceModel: "OKXX1Model",
        key: "OKB",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSX: {
        address: "0x191397f929dAf294C744b60cD2A0EE11DA9652D9",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUSDC: {
        address: "0x1FC94B633F5F25171F86B7b4Ac845e762E3233Bd",
        priceModel: "OKXX1Model",
        key: "USDC",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0x524B4e48E9ADb3eDEb6f1Aa87932B73cAe192db0",
        priceModel: "OKXX1Model",
        key: "USDT",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iDAI: {
        address: "0xC6d76E0706f3F75a13441Fc66A87D76C17BA6E70",
        priceModel: "OKXX1Model",
        key: "DAI",
        decimals: 6,
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
    },
  },
  sepolia: {
    poster: "0x6b29b8af9AF126170513AE6524395E09025b214E",
    assets: {
      iWBTC: {
        address: "0x6005cA02F96B02501C45e39124026daFb9eAD00A",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iETH: {
        address: "0x30aB1041306B11360a72eBDb0e011135AB619486",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iUSDC: {
        address: "0xE78205C4D169034D8691DEf52F5e898c640fE27F",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSDT: {
        address: "0xDDe7cDdEB112bE1a6e8eBA9c06d8ae3946F42010",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseUnits("1.001", 30),
      },
      iDAI: {
        address: "0x2B63d504729b326218d3F341D06153E7Bb82Ee8C",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19",
        heartbeat: ethers.utils.parseUnits("90000", "wei"),
      },
      iUSX: {
        address: "0x05e65497f294f2713Cc88A0AC2a6292c8a31Ba14",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      iUNI: {
        address: "0xEd29103a3bAAB0Ab5Fe1051200821A17337E6fB7",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("5.8"),
      },
      iDF: {
        address: "0x2293044610B9A0eaf259c9Af62e8303c0E389DA2",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("0.042"),
      },
      istETH: {
        address: "0x7BA89BEAB220945666A28E58a1d54c9A713d88Ba",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iARB: {
        address: "0x973a63b55de726b9242C65894C90c676C351179C",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1.62"),
      },
      iMAI: {
        address: "0xfbfAf3b93946f917748b25B44737C8684639cF5F",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
      irETH: {
        address: "0x8c1598b991b5c32c8A6E55FE04e5A1a12B1227C8",
        priceModel: "ChainlinkHeartbeatModel",
        aggregator: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        heartbeat: ethers.utils.parseUnits("7200", "wei"),
      },
      iFRAX: {
        address: "0xec97F8eb10a7602a64f9E396299769c3012CA1ff",
        priceModel: "ReaderPosterModel",
        price: ethers.utils.parseEther("1"),
      },
    },
  },
  holesky: {
    poster: "0xF4Db6BB2bd78b42e3cFbA47B667ff8A2CebB570D",
    assets: {
      iETH: {
        address: "0x888bec98BC26ef4cF59F2506bF780515C4E52d5F",
        priceModel: "PosterModel",
        price: ethers.utils.parseEther("3578.35"),
      },
      issvETH: {
        address: "0xB474637777d087eE3D217ec3258eF7b0c76D16f1",
        priceModel: "ChainlinkModel",
        aggregatorModel: {
          model: "saETHExchangeRateAggregator",
          key: "ssvETH",
          param: [
            "0x888bec98BC26ef4cF59F2506bF780515C4E52d5F", // iETH
            "0x92a38d33007896DbE401eF1Ac4986D811874C8B7", // saETH
          ],
        },
      },
    },
  },
  arbitrumSepolia: {
    poster: "0xF4Db6BB2bd78b42e3cFbA47B667ff8A2CebB570D",
    layer2SequencerUptimeFeed: "0xb8Fe72fd6461b0FC5a68c88E83026f4FC6a2EaE4",
    assets: {
      isaETH: {
        address: "0x65131ADe8F82e0e5205dB764d261814B9b334164",
        priceModel: "Layer2ChainlinkHeartbeatExchangeRateSetModel",
        aggregator: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        heartbeat: ethers.utils.parseUnits("120", "wei"),
        exchangeRate: ethers.utils.parseEther("1.24567890"),
      },
    },
  },
};
