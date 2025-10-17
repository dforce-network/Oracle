// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./PythModel.sol";

/**
 * @title PythInversePriceModel
 * @notice Price model that calculates the reciprocal (inverse) of Pyth oracle prices
 * @dev Useful for converting price pairs (e.g., ETH/USD to USD/ETH)
 */
contract PythInversePriceModel is PythModel {
    /**
     * @notice Initialize the PythInversePriceModel contract.
     * @param _pyth Address of the Pyth oracle contract.
     */
    constructor(address _pyth) public PythModel(_pyth) {}

    /**
     * @dev Get asset price (inverse of the original price).
     * @param _asset Asset address.
     * @return Asset price (reciprocal of Pyth feed price).
     */
    function _getAssetPrice(address _asset)
        internal
        view
        override
        returns (uint256)
    {
        bytes32 _feedID = feedID_[_asset];
        if (_feedID == 0) return 0;
        PythStructs.Price memory _price = pyth.getPriceUnsafe(_feedID);
        if (_price.price <= 0) return 0;

        // Calculate reciprocal price
        // Original price: _price.price * 10^(_price.expo)
        // Reciprocal: 1 / (original price) = 10^(-_price.expo) / _price.price
        // To avoid overflow in _correctPrice, we use: 10^(_expoAbs * 2) / _price.price
        uint256 _expoAbs = uint256(-_price.expo);
        return
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                _expoAbs,
                (10**(_expoAbs.mul(2))).div(uint256(_price.price))
            );
    }

    /**
     * @dev Get asset price status.
     * @param _asset Asset address.
     * @return Asset price status, true: available; false: unavailable.
     */
    function getAssetStatus(address _asset)
        external
        virtual
        override
        returns (bool)
    {
        bytes32 _feedID = feedID_[_asset];

        if (_feedID == 0) return false;

        PythStructs.Price memory _price = pyth.getPriceUnsafe(_feedID);

        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        return block.timestamp < _price.publishTime.add(_assetValidInterval);
    }

    /**
     * @dev The price and status of the asset (inverse price).
     * @param _asset Asset address.
     * @return Asset price (reciprocal) and status.
     */
    function getAssetPriceStatus(address _asset)
        external
        virtual
        override
        returns (uint256, bool)
    {
        bytes32 _feedID = feedID_[_asset];

        if (_feedID == 0) return (0, false);

        PythStructs.Price memory _price = pyth.getPriceUnsafe(_feedID);

        if (_price.price <= 0) return (0, false);

        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        // Calculate reciprocal price with same logic as _getAssetPrice
        uint256 _expoAbs = uint256(-_price.expo);
        return (
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                _expoAbs,
                (10**(_expoAbs.mul(2))).div(uint256(_price.price))
            ),
            block.timestamp < _price.publishTime.add(_assetValidInterval)
        );
    }
}
