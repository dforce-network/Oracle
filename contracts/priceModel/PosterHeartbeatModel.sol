// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./PosterModel.sol";
import "./status/Heartbeat.sol";

contract PosterHeartbeatModel is Heartbeat, PosterModel {
    /**
     * @dev Mapping of asset addresses to updatedAt.
     */
    mapping(address => uint256) internal updatedAt_;

    /// @dev Emitted when `updatedAt_` is changed.
    event SetAssetPostTime(address asset, uint256 updatedAt);

    function _setPrice(address _asset, uint256 _requestedPrice)
        external
        virtual
        override
        onlyOwner
        returns (bool)
    {
        bool _status = _getAssetStatus(_asset);

        updatedAt_[_asset] = block.timestamp;
        bool _setPriceStatus = _setPriceInternal(_asset, _requestedPrice);

        return !_status || _setPriceStatus;
    }

    function _getAssetStatus(address _asset, uint256 _postBuffer)
        internal
        view
        virtual
        returns (bool)
    {
        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        return
            block.timestamp.add(_postBuffer) <
            updatedAt_[_asset].add(_assetValidInterval);
    }

    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        returns (bool)
    {
        return _getAssetStatus(_asset, 0);
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
        return updatedAt_[_asset];
    }

    /**
     * @notice ready to update price.
     * @dev Whether the asset price needs to be updated.
     * @param _asset The asset address.
     * @param _requestedPrice New asset price.
     * @param _postSwing Min swing of the price feed.
     * @param _postBuffer Price invalidation buffer time.
     * @return _success bool true: can be updated; false: no need to update.
     */
    function readyToUpdate(
        address _asset,
        uint256 _requestedPrice,
        uint256 _postSwing,
        uint256 _postBuffer
    ) public view virtual override returns (bool _success) {
        _success = PosterModel.readyToUpdate(
            _asset,
            _requestedPrice,
            _postSwing,
            _postBuffer
        );
        _success = _success || !_getAssetStatus(_asset, _postBuffer);
    }
}
