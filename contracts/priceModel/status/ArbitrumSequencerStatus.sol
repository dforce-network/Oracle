// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../base/Base.sol";

interface FlagsInterface {
    function getFlag(address) external view returns (bool);
}

abstract contract ArbitrumSequencerStatus {
    /// @dev Chainlink flags address.
    FlagsInterface private constant chainlinkFlags_ =
        FlagsInterface(0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83);

    /// @dev Flag should be checked using address(bytes20(bytes32(uint256(keccak256("chainlink.flags.arbitrum-seq-offline")) - 1))) which translates into 0xa438451D6458044c3c8CD2f6f31c91ac882A6d91
    address private constant FLAG_ARBITRUM_SEQ_OFFLINE =
        address(
            bytes20(
                bytes32(
                    uint256(keccak256("chainlink.flags.arbitrum-seq-offline")) -
                        1
                )
            )
        );

    function _sequencerStatus() internal view returns (bool) {
        return chainlinkFlags_.getFlag(FLAG_ARBITRUM_SEQ_OFFLINE);
    }

    /**
     * @dev Get chainlink flags address.
     * @return Chainlink flags address.
     */
    function chainlinkFlags() external pure returns (FlagsInterface) {
        return chainlinkFlags_;
    }

    /**
     * @dev Get FLAG_ARBITRUM_SEQ_OFFLINE address.
     * @return FLAG_ARBITRUM_SEQ_OFFLINE address.
     */
    function flagArbitrumSeq() external pure returns (address) {
        return FLAG_ARBITRUM_SEQ_OFFLINE;
    }
}
