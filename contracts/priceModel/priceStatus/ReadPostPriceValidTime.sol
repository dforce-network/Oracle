// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../price/ReadPostPrice.sol";
import "./PostPriceValidTime.sol";

contract ReadPostPriceValidTime is PostPriceValidTime, ReadPostPrice {

    function _setPrice(address _asset, uint256 _requestedPrice) external override(PostPriceValidTime, ReadPostPrice) virtual onlyOwner returns (uint256) {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset != address(0))
            return assetPrices_[_reader.asset];

        if (validInterval_[_asset] > 0) {
            postTime_[_asset] = block.timestamp;
            return _setPriceInternal(_asset, _requestedPrice);
        }
        return 0;
    }

    function _getAssetPrice(address _asset) internal override(PostPrice, ReadPostPrice) virtual view returns (uint256) {
        return ReadPostPrice._getAssetPrice(_asset);
    }

    function _getAssetStatus(address _asset) internal override virtual view returns (bool) {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset != address(0))
            return PostPriceValidTime._getAssetStatus(_reader.asset);
        return PostPriceValidTime._getAssetStatus(_asset);
    }

    function getAssetStatus(address _asset) external override(PostPrice, PostPriceValidTime) virtual returns (bool) {
        return _getAssetStatus(_asset);
    }

    function getAssetPriceStatus(address _asset) external override(PostPrice, PostPriceValidTime) virtual returns (uint256, bool) {
        return (_getAssetPrice(_asset), _getAssetStatus(_asset));
    }
}