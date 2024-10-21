// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "../interface/IOracle.sol";

import "./base/Base.sol";
import "./base/Unit.sol";
import "../interface/IERC20.sol";

/// @dev Interface for Velodrome/Aerodrome pair
interface IVelodromePair {
    function sample(
        address tokenIn,
        uint256 amountIn,
        uint256 points,
        uint256 window
    ) external view returns (uint256[] memory);
}

/// @title VelodromeModel
/// @notice A contract for read price from Velodrome pairs
contract VelodromeModel is Base, Unit {
    /// @dev Default window for sample() call (usually 300 mins)
    uint256 internal constant DEFAULT_WINDOW = 10;

    /// @dev Struct to store asset-specific data
    struct AssetData {
        bool isToken0;
        address pair;
        address pairToken;
        uint256 window;
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

    /// @dev Event emitted when an asset's window is set
    event SetAssetWindow(address asset, uint256 window);

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
        _assetData.window = DEFAULT_WINDOW;
        emit SetAsset(_asset, _isToken0, _pair, _pairToken);

        _setAssetWindowInternal(_asset, DEFAULT_WINDOW);
    }

    /**
     * @dev Internal function to set the window for an asset
     * @param _asset The address of the asset
     * @param _window The window for TWAP calculation
     */
    function _setAssetWindowInternal(address _asset, uint256 _window)
        internal
        virtual
    {
        require(
            _window > 0,
            "_setAssetWindowInternal: window must greater than zero!"
        );
        AssetData storage _assetData = assetDatas_[_asset];
        _assetData.window = _window;
        emit SetAssetWindow(_asset, _window);
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
     * @param _window The TWAP duration to be set
     */
    function _setAssetWindow(address _asset, uint256 _window)
        external
        onlyOwner
    {
        _setAssetWindowInternal(_asset, _window);
    }

    /**
     * @dev External function to set the TWAP durations for multiple assets in batch
     * @param _assets The array of asset addresses
     * @param _granularities The array of TWAP durations to be set
     */
    function _setAssetWindowBatch(
        address[] calldata _assets,
        uint256[] calldata _granularities
    ) external virtual onlyOwner {
        require(
            _assets.length == _granularities.length,
            "_setAssetWindowBatch: assets & windows must match in length."
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _setAssetWindowInternal(_assets[i], _granularities[i]);
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

        // Call sample() function to get the TWAP amountOut
        // Directly use [0] as only queried 1 point
        uint256 _amountOut = IVelodromePair(_assetData.pair).sample(
            _asset,
            _amountIn,
            1,
            _assetData.window
        )[0];

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
     * the window for quote() call.
     * @param _asset The address of the asset for which data is being retrieved.
     * @return _isToken0 A boolean indicating if the asset is token0 in the pair.
     * @return _pair The address of the Uniswap V2 pair associated with the asset.
     * @return _pairToken The address of the token paired with the asset.
     * @return _window The duration for which the TWAP is calculated.
     */
    function assetData(address _asset)
        external
        view
        returns (
            bool _isToken0,
            address _pair,
            address _pairToken,
            uint256 _window
        )
    {
        AssetData storage _assetData = assetDatas_[_asset];
        _isToken0 = _assetData.isToken0;
        _pair = _assetData.pair;
        _pairToken = _assetData.pairToken;
        _window = _assetData.window;
    }

    /**
     * @dev Returns the default window for sample() call.
     * @return The default window.
     */
    function defaultWindow() external pure returns (uint256) {
        return DEFAULT_WINDOW;
    }
}
