// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./base/Base.sol";
import "./base/Unit.sol";
import "../interface/IERC20.sol";

import "../interface/pyth/IPyth.sol";

contract PythModel is Base, Unit {
    IPyth public immutable pyth;

    /// @dev Mapping of asset addresses to feedIDs.
    mapping(address => bytes32) internal feedID_;

    /// @dev Emitted when `feedID_` is changed.
    event SetAssetFeedID(address asset, bytes32 feedID);

    constructor(address _pyth) public {
        pyth = IPyth(_pyth);
    }

    /**
     * @notice Set `feedID` for asset to the specified address.
     * @dev Owner function to change of feedID.
     * @param _asset Asset for which to set the `feedID`.
     * @param _feedID feedID to assign for `asset`.
     */
    function _setAssetFeedID(
        address _asset,
        bytes32 _feedID
    ) public virtual onlyOwner {
        require(
            pyth.priceFeedExists(_feedID),
            "_setAssetFeedID: feedID does not exist!"
        );

        bytes32 _oldAssetFeedID = feedID_[_asset];
        require(
            _feedID != _oldAssetFeedID,
            "_setAssetFeedID: Old and new address cannot be the same."
        );

        feedID_[_asset] = _feedID;
        emit SetAssetFeedID(_asset, _feedID);
    }

    /**
     * @notice Set `feedID` for assets to the specified addresses.
     * @dev Owner function to change of feedIDs.
     * @param _assets Assets for which to set the `feedID`.
     * @param _feedIDs feedIDs to assign for `assets`.
     */
    function _setAssetFeedIDBatch(
        address[] calldata _assets,
        bytes32[] calldata _feedIDs
    ) external virtual {
        require(
            _assets.length == _feedIDs.length,
            "_setAssetFeedIDBatch: assets & feedIDs must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setAssetFeedID(_assets[i], _feedIDs[i]);
    }

    /**
     * @notice Set the asset’s `feedID` to disabled.
     * @dev Owner function to disable of feedID.
     * @param _asset Asset for which to disable the `feedID`.
     */
    function _disableAssetFeedID(address _asset) public virtual onlyOwner {
        require(
            _getAssetPrice(_asset) > 0,
            "_disableAssetFeedID: The price of local assets cannot be 0!"
        );

        delete feedID_[_asset];
        emit SetAssetFeedID(_asset, feedID_[_asset]);
    }

    /**
     * @notice Disable `feedID` for assets to the specified addresses.
     * @dev Owner function to disable of feedIDs.
     * @param _assets Assets for which to disable the `feedID`.
     */
    function _disableAssetFeedIDBatch(address[] calldata _assets) external {
        for (uint256 i = 0; i < _assets.length; i++)
            _disableAssetFeedID(_assets[i]);
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return Asset price.
     */
    function _getAssetPrice(
        address _asset
    ) internal view virtual returns (uint256) {
        bytes32 _feedID = feedID_[_asset];
        if (_feedID == 0) return 0;
        PythStructs.Price memory price = pyth.getPriceUnsafe(_feedID);
        if (price.price < 0) return 0;
        return
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                uint256(-price.expo),
                uint256(price.price)
            );
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return Asset price.
     */
    function getAssetPrice(
        address _asset
    ) external virtual override returns (uint256) {
        return _getAssetPrice(_asset);
    }

    /**
     * @dev Get asset price status.
     * @param _asset Asset address.
     * @return Asset price status, true: available; false: unavailable.
     */
    function getAssetStatus(
        address _asset
    ) external virtual override returns (bool) {
        bytes32 _feedID = feedID_[_asset];

        if (_feedID == 0) return false;

        PythStructs.Price memory price = pyth.getPriceUnsafe(_feedID);
        uint256 _assetValidInterval = pyth.getValidTimePeriod();

        return block.timestamp < price.publishTime.add(_assetValidInterval);
    }

    /**
     * @dev The price and status of the asset.
     * @param _asset Asset address.
     * @return Asset price and status.
     */
    function getAssetPriceStatus(
        address _asset
    ) external virtual override returns (uint256, bool) {
        bytes32 _feedID = feedID_[_asset];

        if (_feedID == 0) return (0, false);

        PythStructs.Price memory _price = pyth.getPriceUnsafe(_feedID);

        if (_price.price < 0) return (0, false);

        uint256 _assetValidInterval = pyth.getValidTimePeriod();

        return (
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                uint256(-_price.expo),
                uint256(_price.price)
            ),
            block.timestamp < _price.publishTime.add(_assetValidInterval)
        );
    }
}
