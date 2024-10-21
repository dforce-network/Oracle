// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "../interface/IOracle.sol";

import "./base/Base.sol";
import "./base/Unit.sol";
import "../interface/IERC20.sol";

/// @dev Interface for Velodrome/Aerodrome pair
interface IVelodromePair {
    function quote(
        address tokenIn,
        uint256 amountIn,
        uint256 granularity
    ) external view returns (uint256 amountOut);
}

/// @title VelodromeModel
/// @notice A contract for read price from Velodrome pairs
contract VelodromeModel is Base, Unit {
    /// @dev Default granularity for quote() call (usually 30 mins)
    uint256 internal constant DEFAULT_GRANULARITY = 1;

    /// @dev Struct to store asset-specific data
    struct AssetData {
        bool isToken0;
        address pair;
        address pairToken;
        uint256 granularity;
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

    /// @dev Event emitted when an asset's granularity is set
    event SetAssetGranularity(address asset, uint256 granularity);

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
        _assetData.granularity = DEFAULT_GRANULARITY;
        emit SetAsset(_asset, _isToken0, _pair, _pairToken);

        _setAssetGranularityInternal(_asset, DEFAULT_GRANULARITY);
    }

    /**
     * @dev Internal function to set the granularity for an asset
     * @param _asset The address of the asset
     * @param _granularity The granularity for TWAP calculation
     */
    function _setAssetGranularityInternal(address _asset, uint256 _granularity)
        internal
        virtual
    {
        require(
            _granularity > 0,
            "_setAssetGranularityInternal: granularity must greater than zero!"
        );
        AssetData storage _assetData = assetDatas_[_asset];
        _assetData.granularity = _granularity;
        emit SetAssetGranularity(_asset, _granularity);
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
     * @param _granularity The TWAP duration to be set
     */
    function _setAssetGranularity(address _asset, uint256 _granularity)
        external
        onlyOwner
    {
        _setAssetGranularityInternal(_asset, _granularity);
    }

    /**
     * @dev External function to set the TWAP durations for multiple assets in batch
     * @param _assets The array of asset addresses
     * @param _granularities The array of TWAP durations to be set
     */
    function _setAssetGranularityBatch(
        address[] calldata _assets,
        uint256[] calldata _granularities
    ) external virtual onlyOwner {
        require(
            _assets.length == _granularities.length,
            "_setAssetgranularityBatch: assets & granularitys must match in length."
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _setAssetGranularityInternal(_assets[i], _granularities[i]);
        }
    }

    /**
     * @dev Internal function to get the price of an asset.
     * @param _asset The address of the asset.
     * @return The price of the asset.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        AssetData storage _assetData = assetDatas_[_asset];

        // Check if the pair contract is set
        require(_assetData.pair != address(0), "Pair not set for this asset");

        // Use the token's decimals for the price scale factor
        uint256 _tokenDecimals = IERC20(_asset).decimals();
        uint256 _amountIn = 10**_tokenDecimals;

        // Call quote() function to get the TWAP amountOut
        uint256 _amountOut = IVelodromePair(_assetData.pair).quote(
            _asset,
            _amountIn,
            _assetData.granularity
        );

        return
            _amountOut
                .mul(IOracle(owner).getUnderlyingPrice(_assetData.pairToken))
                .div(_amountIn);
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
     * @dev Retrieves the asset data for a given asset address.
     * This function provides information about the asset's status in the TWAP model,
     * including whether it is token0 in the pair, the pair address, the paired token address,
     * the granularity for quote() call.
     * @param _asset The address of the asset for which data is being retrieved.
     * @return _isToken0 A boolean indicating if the asset is token0 in the pair.
     * @return _pair The address of the Uniswap V2 pair associated with the asset.
     * @return _pairToken The address of the token paired with the asset.
     * @return _granularity The duration for which the TWAP is calculated.
     */
    function assetData(address _asset)
        external
        view
        returns (
            bool _isToken0,
            address _pair,
            address _pairToken,
            uint256 _granularity
        )
    {
        AssetData storage _assetData = assetDatas_[_asset];
        _isToken0 = _assetData.isToken0;
        _pair = _assetData.pair;
        _pairToken = _assetData.pairToken;
        _granularity = _assetData.granularity;
    }

    /**
     * @dev Returns the default granularity for quote() call.
     * @return The default granularity.
     */
    function defaultGranularity() external pure returns (uint256) {
        return DEFAULT_GRANULARITY;
    }
}
