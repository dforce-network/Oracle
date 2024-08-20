// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/FixedPoint.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol";

import "../interface/IOracle.sol";

import "./base/Base.sol";
import "./base/Unit.sol";

/// @title UniV2TwapModel
/// @notice A contract for managing Time-Weighted Average Price (TWAP) data for Uniswap V2 pairs
contract UniV2TwapModel is Base, Unit {
    using FixedPoint for *;

    /// @dev Default duration for TWAP calculation (7 days)
    uint256 internal constant DEFAULT_DURATION = 7 days;

    /// @dev Struct to store TWAP data points
    struct Twap {
        uint256 timestamp;
        uint256 priceCumulative;
    }

    /// @dev Struct to store asset-specific data
    struct AssetData {
        bool isToken0;
        address pair;
        address pairToken;
        uint256 twapDuration;
        uint256 twapLength;
        mapping(uint256 => Twap) twap;
    }

    /// @dev Mapping of asset address to its AssetData
    mapping(address => AssetData) internal assetDatas_;

    /// @dev Event emitted when an asset is set
    event SetAsset(
        address asset,
        bool isToken0,
        address pair,
        address pairToken
    );

    /// @dev Event emitted when an asset's TWAP duration is set
    event SetAssetTwapDuration(address asset, uint256 twapDuration);

    /// @dev Event emitted when a new TWAP data point is set for an asset
    event SetAssetTwap(
        address asset,
        uint256 twapId,
        uint256 timestamp,
        uint256 priceCumulative
    );

    /**
     * @dev Internal function to set asset data
     * @param _asset The address of the asset
     * @param _pair The address of the Uniswap V2 pair
     */
    function _setAssetPairInternal(address _asset, address _pair)
        internal
        virtual
    {
        AssetData storage _assetData = assetDatas_[_asset];
        require(
            _pair != _assetData.pair,
            "_setAssetPairInternal: Old and new address cannot be the same."
        );

        address _token0 = IUniswapV2Pair(_pair).token0();
        address _token1 = IUniswapV2Pair(_pair).token1();
        bool _isToken0 = _token0 == _asset;
        address _pairToken = _isToken0 ? _token1 : _token0;

        require(
            _isToken0 || _token1 == _asset,
            "_setAssetPairInternal: asset is not in the pair"
        );

        require(
            IOracle(owner).getUnderlyingPrice(_pairToken) > 0,
            "_setAssetPairInternal: other pair token price unavailable!"
        );

        _assetData.isToken0 = _isToken0;
        _assetData.pair = _pair;
        _assetData.pairToken = _pairToken;
        _assetData.twapDuration = DEFAULT_DURATION;
        emit SetAsset(_asset, _isToken0, _pair, _pairToken);

        _setAssetTwapDurationInternal(_asset, DEFAULT_DURATION);
        _refreshAssetTwap(_asset);
    }

    /**
     * @dev Internal function to set the TWAP duration for an asset
     * @param _asset The address of the asset
     * @param _twapDuration The duration for TWAP calculation
     */
    function _setAssetTwapDurationInternal(
        address _asset,
        uint256 _twapDuration
    ) internal virtual {
        require(
            _twapDuration > 0,
            "_setAssetTwapDurationInternal: TWAP duration is greater than zero!"
        );
        AssetData storage _assetData = assetDatas_[_asset];
        _assetData.twapDuration = _twapDuration;
        emit SetAssetTwapDuration(_asset, _twapDuration);
    }

    /**
     * @dev Internal function to refresh the TWAP data for an asset
     * @param _asset The address of the asset
     */
    function _refreshAssetTwap(address _asset) internal virtual {
        AssetData storage _assetData = assetDatas_[_asset];

        (
            uint256 _price0Cumulative,
            uint256 _price1Cumulative,

        ) = UniswapV2OracleLibrary.currentCumulativePrices(_assetData.pair);

        _assetData.twapLength = 0;
        _updateAssetTwap(
            _assetData,
            _asset,
            _assetData.isToken0 ? _price0Cumulative : _price1Cumulative,
            block.timestamp
        );
    }

    /**
     * @dev Internal function to update the TWAP data for an asset
     * @param _assetData The storage reference to the asset data
     * @param _asset The address of the asset
     * @param _priceCumulativeEnd The cumulative price at the end of the period
     * @param _timestamp The timestamp at the end of the period
     */
    function _updateAssetTwap(
        AssetData storage _assetData,
        address _asset,
        uint256 _priceCumulativeEnd,
        uint256 _timestamp
    ) internal virtual {
        uint256 _twapId = _assetData.twapLength++;
        _assetData.twap[_twapId].priceCumulative = _priceCumulativeEnd;
        _assetData.twap[_twapId].timestamp = _timestamp;

        emit SetAssetTwap(_asset, _twapId, _priceCumulativeEnd, _timestamp);
    }

    /**
     * @dev External function to set an asset and its corresponding pair
     * @param _asset The address of the asset
     * @param _pair The address of the pair
     */
    function _setAssetPair(address _asset, address _pair) external onlyOwner {
        _setAssetPairInternal(_asset, _pair);
    }

    /**
     * @dev External function to set multiple assets and their corresponding pairs in batch
     * @param _assets The array of asset addresses
     * @param _pairs The array of pair addresses
     */
    function _setAssetPairBatch(
        address[] calldata _assets,
        address[] calldata _pairs
    ) external virtual onlyOwner {
        require(
            _assets.length == _pairs.length,
            "_setAssetPairBatch: assets & pairs must match in length."
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _setAssetPairInternal(_assets[i], _pairs[i]);
        }
    }

    /**
     * @dev External function to set the TWAP duration for an asset
     * @param _asset The address of the asset
     * @param _twapDuration The TWAP duration to be set
     */
    function _setAssetTwapDuration(address _asset, uint256 _twapDuration)
        external
        onlyOwner
    {
        _setAssetTwapDurationInternal(_asset, _twapDuration);
    }

    /**
     * @dev External function to set the TWAP durations for multiple assets in batch
     * @param _assets The array of asset addresses
     * @param _twapDurations The array of TWAP durations to be set
     */
    function _setAssetTwapDurationBatch(
        address[] calldata _assets,
        uint256[] calldata _twapDurations
    ) external virtual onlyOwner {
        require(
            _assets.length == _twapDurations.length,
            "_setAssetTwapDurationBatch: assets & twapDurations must match in length."
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _setAssetTwapDurationInternal(_assets[i], _twapDurations[i]);
        }
    }

    /**
     * @dev Retrieves the TWAP (Time-Weighted Average Price) data for a given asset at a specific timestamp.
     * @param _assetData The storage reference to the asset's data structure containing TWAP information.
     * @param _timestamp The timestamp for which the TWAP data is being retrieved.
     * @return _priceCumulativeStart The cumulative price at the start of the TWAP period.
     * @return _timeElapsed The time elapsed since the last TWAP update.
     * @return _isUpdate A boolean indicating whether the TWAP should be updated based on the elapsed time.
     */
    function _getTwapDataByTimestamp(
        AssetData storage _assetData,
        uint256 _timestamp
    )
        internal
        view
        returns (
            uint256 _priceCumulativeStart,
            uint256 _timeElapsed,
            bool _isUpdate
        )
    {
        uint256 _twapId = _assetData.twapLength.sub(1);

        _timeElapsed = _timestamp.sub(_assetData.twap[_twapId].timestamp);
        _isUpdate = _timeElapsed >= _assetData.twapDuration;

        // If the time elapsed is less than half the TWAP duration, check the previous TWAP entry.
        if (_twapId > 0 && _timeElapsed < _assetData.twapDuration / 2) {
            _twapId--;
            _timeElapsed = _timestamp.sub(_assetData.twap[_twapId].timestamp);
        }
        _priceCumulativeStart = _assetData.twap[_twapId].priceCumulative;
    }

    /**
     * @dev Internal function to get the price of an asset.
     * @param _asset The address of the asset.
     * @return The price of the asset.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        AssetData storage _assetData = assetDatas_[_asset];

        (
            uint256 _price0Cumulative,
            uint256 _price1Cumulative,

        ) = UniswapV2OracleLibrary.currentCumulativePrices(_assetData.pair);
        uint256 _priceCumulativeEnd = _assetData.isToken0
            ? _price0Cumulative
            : _price1Cumulative;

        uint256 _timestamp = block.timestamp;
        (
            uint256 _priceCumulativeStart,
            uint256 _timeElapsed,
            bool _isUpdate
        ) = _getTwapDataByTimestamp(_assetData, _timestamp);

        // If an update is needed, update the asset's TWAP.
        if (_isUpdate) {
            _updateAssetTwap(
                _assetData,
                _asset,
                _priceCumulativeEnd,
                _timestamp
            );
        }

        if (_timeElapsed == 0) return 0;

        FixedPoint.uq112x112 memory _priceAverage = FixedPoint.uq112x112(
            uint224(
                (
                    _priceCumulativeEnd.sub(_priceCumulativeStart).div(
                        _timeElapsed
                    )
                )
            )
        );

        return
            _priceAverage
                .mul(IOracle(owner).getUnderlyingPrice(_assetData.pairToken))
                .decode144();
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return Asset price.
     */
    function getAssetPrice(address _asset)
        external
        virtual
        override
        returns (uint256)
    {
        return _getAssetPrice(_asset);
    }

    /**
     * @dev Get asset price status.
     * @return Asset price status, always true.
     */
    function getAssetStatus(address) external virtual override returns (bool) {
        return true;
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
        return (_getAssetPrice(_asset), true);
    }

    /**
     * @dev Get TWAP data for a specific asset at a given timestamp.
     * @param _asset The address of the asset.
     * @param _timestamp The timestamp for which to retrieve the data.
     * @return The TWAP data: timestamp, price cumulative, and a boolean indicating success.
     */
    function getTwapDataByTimestamp(address _asset, uint256 _timestamp)
        external
        view
        returns (
            uint256,
            uint256,
            bool
        )
    {
        return _getTwapDataByTimestamp(assetDatas_[_asset], _timestamp);
    }

    /**
     * @dev Retrieves the asset data for a given asset address.
     * This function provides information about the asset's status in the TWAP model,
     * including whether it is token0 in the pair, the pair address, the paired token address,
     * the duration for TWAP calculation, and the length of the TWAP data.
     * @param _asset The address of the asset for which data is being retrieved.
     * @return _isToken0 A boolean indicating if the asset is token0 in the pair.
     * @return _pair The address of the Uniswap V2 pair associated with the asset.
     * @return _pairToken The address of the token paired with the asset.
     * @return _twapDuration The duration for which the TWAP is calculated.
     * @return _twapLength The number of TWAP data points recorded for the asset.
     */
    function assetData(address _asset)
        external
        view
        returns (
            bool _isToken0,
            address _pair,
            address _pairToken,
            uint256 _twapDuration,
            uint256 _twapLength
        )
    {
        AssetData storage _assetData = assetDatas_[_asset];
        _isToken0 = _assetData.isToken0;
        _pair = _assetData.pair;
        _pairToken = _assetData.pairToken;
        _twapDuration = _assetData.twapDuration;
        _twapLength = _assetData.twapLength;
    }

    /**
     * @dev Retrieves the Time-Weighted Average Price (TWAP) data for a specific asset
     *      at a given TWAP ID. This function allows users to access historical TWAP data
     *      for analysis or reporting purposes.
     * @param _asset The address of the asset for which the TWAP data is being requested.
     * @param _twapId The unique identifier for the TWAP data point to retrieve.
     * @return _timestamp The timestamp when the TWAP data was recorded.
     * @return _priceCumulative The cumulative price at the time of the TWAP data point.
     */
    function assetTwap(address _asset, uint256 _twapId)
        external
        view
        returns (uint256 _timestamp, uint256 _priceCumulative)
    {
        AssetData storage _assetData = assetDatas_[_asset];
        _timestamp = _assetData.twap[_twapId].timestamp;
        _priceCumulative = _assetData.twap[_twapId].priceCumulative;
    }

    /**
     * @dev Returns the default duration for TWAP calculations.
     * This function is pure, meaning it does not modify the state of the contract.
     * @return The default duration in seconds.
     */
    function defaultDuration() external pure returns (uint256) {
        return DEFAULT_DURATION;
    }
}
