// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../ChainlinkStocksModel.sol";
import "../status/ChainlinkSequencerStatus.sol";

contract Layer2ChainlinkStocksModel is
    ChainlinkStocksModel,
    ChainlinkSequencerStatus
{
    /**
     * @dev The constructor sets some data and initializes the owner
     * @param _timeZone Time zone.
     * @param _marketOpeningTime The market is open every day.
     * @param _duration Market duration.
     * @param _sequencerUptimeFeed The address of the Chainlink sequencer.
     */
    constructor(
        int256 _timeZone,
        uint256 _marketOpeningTime,
        uint256 _duration,
        IChainlinkAggregator _sequencerUptimeFeed
    ) public ChainlinkStocksModel(_timeZone, _marketOpeningTime, _duration) {
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
        return _getAssetStatus(_asset, block.timestamp) && _sequencerStatus();
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
        return (
            _getAssetPrice(_asset),
            _getAssetStatus(_asset, block.timestamp) && _sequencerStatus()
        );
    }
}
