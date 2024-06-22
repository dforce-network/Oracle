// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../base/Base.sol";

import "../../library/SafeRatioMath.sol";

/**
 * @title ExchangeRateSet
 * @dev This contract manages exchange rates for various assets.
 */
abstract contract ExchangeRateSet is Base {
    using SafeRatioMath for uint256;

    mapping(address => uint256) internal exchangeRates_;

    /// @dev Emitted when the exchange rate for an asset is changed.
    event SetExchangeRate(address asset, uint256 exchangeRate);

    /**
     * @notice Sets the exchange rate for a given asset to a specified value.
     * @dev This function updates the exchange rate for a specific asset.
     * @param _asset The address of the asset for which the exchange rate is being set.
     * @param _exchangeRate The new exchange rate value to be assigned.
     */
    function _setExchangeRateInternal(address _asset, uint256 _exchangeRate)
        internal
    {
        require(
            _exchangeRate != 0 && _exchangeRate != exchangeRates_[_asset],
            "_setExchangeRateInternal: The exchange rate is invalid!"
        );

        exchangeRates_[_asset] = _exchangeRate;
        emit SetExchangeRate(_asset, _exchangeRate);
    }

    /**
     * @notice Sets the exchange rate for a single asset.
     * @dev This function updates the exchange rate for a specific asset.
     * @param _asset The address of the asset for which the exchange rate is being set.
     * @param _exchangeRate The new exchange rate value to be assigned.
     */
    function _setExchangeRate(address _asset, uint256 _exchangeRate)
        external
        virtual
        onlyOwner
    {
        _setExchangeRateInternal(_asset, _exchangeRate);
    }

    /**
     * @notice Sets exchange rates for multiple assets in a batch.
     * @dev This function updates the exchange rates for multiple assets in a single call.
     * @param _assets An array of addresses of the assets for which exchange rates are being set.
     * @param _exchangeRates An array of new exchange rate values to be assigned, corresponding to the assets.
     */
    function _setExchangeRateBatch(
        address[] calldata _assets,
        uint256[] calldata _exchangeRates
    ) external virtual onlyOwner {
        require(
            _assets.length == _exchangeRates.length,
            "_setExchangeRateBatch: assets & validIntervals must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setExchangeRateInternal(_assets[i], _exchangeRates[i]);
    }

    /**
     * @dev Calculates the price of an asset based on its exchange rate.
     * @param _asset The address of the asset.
     * @param _assetPrice The price of the asset.
     * @return The price of the asset after applying the exchange rate.
     */
    function _getExchangeRatePrice(address _asset, uint256 _assetPrice)
        internal
        view
        returns (uint256)
    {
        return _assetPrice.rmul(exchangeRates_[_asset]);
    }

    /**
     * @notice Calculates the price of an asset based on its exchange rate.
     * @dev This function calls the internal function to calculate the price of an asset after applying its exchange rate.
     * @param _asset The address of the asset.
     * @param _assetPrice The price of the asset.
     * @return The price of the asset after applying the exchange rate.
     */
    function getExchangeRatePrice(address _asset, uint256 _assetPrice)
        external
        view
        returns (uint256)
    {
        return _getExchangeRatePrice(_asset, _assetPrice);
    }

    /**
     * @notice Retrieves the exchange rate for a given asset.
     * @dev This function returns the exchange rate for a specific asset.
     * @param _asset The address of the asset.
     * @return The exchange rate of the asset.
     */
    function exchangeRate(address _asset) external view returns (uint256) {
        return exchangeRates_[_asset];
    }
}
