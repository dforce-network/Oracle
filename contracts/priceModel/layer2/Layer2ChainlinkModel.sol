// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../ChainlinkModel.sol";
import "../status/ChainlinkSequencerStatus.sol";

contract Layer2ChainlinkModel is ChainlinkModel, ChainlinkSequencerStatus {
    /**
     * @notice Only for the implementation contract, as for the proxy pattern,
     *            should call `initialize()` separately.
     * @param _sequencerUptimeFeed The address of the Chainlink sequencer.
     */
    constructor(IChainlinkAggregator _sequencerUptimeFeed) public Base() {
        _setChainlinkSequencer(_sequencerUptimeFeed);
    }

    /**
     * @dev Get asset price status.
     * @param _asset Asset address.
     * @return Asset price status, ture: available; false: unavailable.
     */
    function getAssetStatus(address _asset)
        external
        virtual
        override
        returns (bool)
    {
        _asset;
        return _sequencerStatus();
    }

    /**
     * @dev The price and status of the asset.
     * @param _asset Asset address.
     * @return Asset price and status.
     */
    function getAssetPriceStatus(address _asset)
        external
        virtual
        override
        returns (uint256, bool)
    {
        return (_getAssetPrice(_asset), _sequencerStatus());
    }
}
