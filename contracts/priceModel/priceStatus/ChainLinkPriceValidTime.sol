// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../price/ChainLinkPrice.sol";
import "./ValidTime.sol";

contract ChainLinkPriceValidTime is ValidTime, ChainLinkPrice {

    function getAssetStatus(address _asset) external override virtual returns (bool) {
        IChainlinkAggregator _aggregator = IChainlinkAggregator(aggregator_[_asset]);
        if (_aggregator == IChainlinkAggregator(0))
            return false;
        (, , , uint256 _updatedAt,) = _aggregator.latestRoundData();
        return block.timestamp < _updatedAt.add(validInterval_[_asset]);
    }

    function getAssetPriceStatus(address _asset) external override virtual returns (uint256, bool) {
        IChainlinkAggregator _aggregator = IChainlinkAggregator(aggregator_[_asset]);
        if (_aggregator == IChainlinkAggregator(0))
            return (0, false);
        (, int256 _answer, , uint256 _updatedAt,) = _aggregator.latestRoundData();
        return (_calcDecimal(uint256(IERC20(_asset).decimals()) , uint256(_aggregator.decimals()), uint256(_answer)), block.timestamp < _updatedAt.add(validInterval_[_asset]));
    }
}