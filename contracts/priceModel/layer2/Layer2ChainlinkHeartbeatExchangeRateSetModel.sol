// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./Layer2ChainlinkHeartbeatModel.sol";
import "../exchangeRate/ExchangeRateSet.sol";

/**
 * @title Layer2ChainlinkHeartbeatExchangeRateSetModel
 * @dev This contract combines the functionality of Layer2ChainlinkHeartbeatModel and ExchangeRateSet.
 */
contract Layer2ChainlinkHeartbeatExchangeRateSetModel is
    Layer2ChainlinkHeartbeatModel,
    ExchangeRateSet
{
    /**
     * @notice This constructor is only for the implementation contract, as per the proxy pattern.
     * It should call `initialize()` separately.
     * @param _sequencerUptimeFeed The address of the Chainlink sequencer.
     */
    constructor(IChainlinkAggregator _sequencerUptimeFeed)
        public
        Layer2ChainlinkHeartbeatModel(_sequencerUptimeFeed)
    {}

    /**
     * @dev Retrieves the price of an asset by recursively calling _getExchangeRatePrice.
     * @param _asset The address of the asset for which to retrieve the price.
     * @return The price of the asset.
     */
    function _getAssetPrice(address _asset)
        internal
        view
        virtual
        override
        returns (uint256)
    {
        // This function makes a recursive call to _getExchangeRatePrice, passing the asset address and its price.
        // The price is obtained by calling the parent contract's _getAssetPrice function.
        return _getExchangeRatePrice(_asset, super._getAssetPrice(_asset));
    }

    /**
     * @dev Retrieves the price and status of the asset.
     * @param _asset The address of the asset.
     * @return A tuple containing the asset price and its status.
     */
    function getAssetPriceStatus(address _asset)
        external
        virtual
        override
        returns (uint256, bool)
    {
        IChainlinkAggregator _aggregator = IChainlinkAggregator(
            aggregator_[_asset]
        );
        if (_aggregator == IChainlinkAggregator(0)) return (0, false);

        (, int256 _answer, , uint256 _updatedAt, ) = _aggregator
        .latestRoundData();

        if (_answer < 0) return (0, false);

        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        return (
            _getExchangeRatePrice(
                _asset,
                _correctPrice(
                    uint256(IERC20(_asset).decimals()),
                    uint256(_aggregator.decimals()),
                    uint256(_answer)
                )
            ),
            // Check if the current block timestamp is within the valid interval and the sequencer is active.
            block.timestamp < _updatedAt.add(_assetValidInterval) &&
                _sequencerStatus()
        );
    }
}
