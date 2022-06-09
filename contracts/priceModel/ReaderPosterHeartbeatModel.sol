// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./ReaderPosterModel.sol";
import "./PosterHeartbeatModel.sol";

contract ReaderPosterHeartbeatModel is PosterHeartbeatModel, ReaderPosterModel {
    /**
     * @dev Set price for an asset.
     * @param _asset Asset address.
     * @param _requestedPrice Requested new price, scaled by 10**18.
     * @return Boolean ture:success, false:fail.
     */
    function _setPrice(address _asset, uint256 _requestedPrice)
        external
        virtual
        override(PosterHeartbeatModel, ReaderPosterModel)
        onlyOwner
        returns (bool)
    {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset != address(0)) return false;

        if (validInterval_[_asset] > 0) {
            postTime_[_asset] = block.timestamp;
            return _setPriceInternal(_asset, _requestedPrice);
        }
        return false;
    }

    function _getAssetPrice(address _asset)
        internal
        view
        virtual
        override(PosterModel, ReaderPosterModel)
        returns (uint256)
    {
        return ReaderPosterModel._getAssetPrice(_asset);
    }

    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        override
        returns (bool)
    {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset != address(0))
            return PosterHeartbeatModel._getAssetStatus(_reader.asset);
        return PosterHeartbeatModel._getAssetStatus(_asset);
    }

    function getAssetStatus(address _asset)
        external
        virtual
        override(PosterModel, PosterHeartbeatModel)
        returns (bool)
    {
        return _getAssetStatus(_asset);
    }

    function getAssetPriceStatus(address _asset)
        external
        virtual
        override(PosterModel, PosterHeartbeatModel)
        returns (uint256, bool)
    {
        return (_getAssetPrice(_asset), _getAssetStatus(_asset));
    }
}