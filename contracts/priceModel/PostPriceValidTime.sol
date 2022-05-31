// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./PostPrice.sol";
import "./status/ValidTime.sol";

contract PostPriceValidTime is ValidTime, PostPrice {
    /**
     * @dev Mapping of asset addresses to validInterval.
     */
    mapping(address => uint256) internal postTime_;

    /**
     * @dev Emitted for asset validInterval changes.
     */
    event SetAssetPostTime(address asset, address validInterval);

    function _setPrice(address _asset, uint256 _requestedPrice)
        external
        virtual
        override
        onlyOwner
        returns (uint256)
    {
        if (validInterval_[_asset] > 0) {
            postTime_[_asset] = block.timestamp;
            return _setPriceInternal(_asset, _requestedPrice);
        }
        return 0;
    }

    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        returns (bool)
    {
        return block.timestamp < postTime_[_asset].add(validInterval_[_asset]);
    }

    function getAssetStatus(address _asset)
        external
        virtual
        override
        returns (bool)
    {
        return _getAssetStatus(_asset);
    }

    function getAssetPriceStatus(address _asset)
        external
        virtual
        override
        returns (uint256, bool)
    {
        return (_getAssetPrice(_asset), _getAssetStatus(_asset));
    }

    function postTime(address _asset) external view returns (uint256) {
        return postTime_[_asset];
    }
}
