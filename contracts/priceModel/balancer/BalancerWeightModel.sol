// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./BalancerBase.sol";

import "../../interface/IOracle.sol";

/// @title BalancerWeightModel
/// @dev Contract for managing Balancer weighted pools
/// @notice Inherits from BalancerBase
contract BalancerWeightModel is BalancerBase {
    /// @dev Constant representing the base unit (1 ether)
    uint256 internal constant BASE = 1 ether;

    /// @dev Struct to store data for asset weight pools
    struct AssetWeightPoolData {
        address pool;
        address priceToken;
        bytes32 poolId;
        uint256 tokenIndex;
        uint256 priceTokenIndex;
        uint256 poolWeight;
    }

    /// @dev Mapping to store AssetWeightPoolData for each asset address
    mapping(address => AssetWeightPoolData) internal assetWeightPoolDatas_;

    /// @dev Event emitted when a weighted pool is set for an asset
    event SetAssetWeightPool(
        address asset,
        address pool,
        address priceToken,
        bytes32 poolId,
        uint256 tokenIndex,
        uint256 priceTokenIndex,
        uint256 poolWeight
    );

    /**
     * @dev Constructor to initialize the BalancerWeightModel contract
     * @param _vault Address of the Balancer Vault
     * @notice This constructor calls the BalancerBase constructor with the provided vault address
     * @notice It sets up the initial state for the BalancerWeightModel contract
     */
    constructor(IVault _vault) public BalancerBase(_vault) {}

    /**
     * @dev Internal function to set the weight pool data for an asset
     * @param _asset Address of the asset token
     * @param _pool Address of the Balancer weighted pool
     */
    function _setAssetWeightPoolInternal(address _asset, address _pool)
        internal
        virtual
    {
        require(
            IWeightedPool(_pool).getVault() == VAULT,
            "_setAssetWeightPoolInternal: Invalid pool address!"
        );

        AssetWeightPoolData storage _poolData = assetWeightPoolDatas_[_asset];
        require(
            _pool != _poolData.pool,
            "_setAssetWeightPoolInternal: Old and new address cannot be the same!"
        );

        bytes32 _poolId = IWeightedPool(_pool).getPoolId();

        (IERC20[] memory _tokens, , ) = VAULT.getPoolTokens(_poolId);
        (uint256 _tokenIndex, uint256 _priceTokenIndex) = _asset ==
            address(_tokens[0])
            ? (0, 1)
            : (1, 0);
        require(
            _asset == address(_tokens[_tokenIndex]),
            "_setAssetWeightPoolInternal: `_asset` is not in the pool!"
        );

        address _priceToken = address(_tokens[_priceTokenIndex]);
        require(
            IOracle(owner).getUnderlyingPrice(_priceToken) > 0,
            "_setAssetWeightPoolInternal: Another token price is unavailable!"
        );

        uint256[] memory _weights = IWeightedPool(_pool).getNormalizedWeights();
        uint256 _poolWeight = _weights[_tokenIndex].mul(BASE).div(
            _weights[_priceTokenIndex]
        );

        _poolData.pool = _pool;
        _poolData.priceToken = _priceToken;
        _poolData.poolId = _poolId;
        _poolData.tokenIndex = _tokenIndex;
        _poolData.priceTokenIndex = _priceTokenIndex;
        _poolData.poolWeight = _poolWeight;
        emit SetAssetWeightPool(
            _asset,
            _pool,
            _priceToken,
            _poolId,
            _tokenIndex,
            _priceTokenIndex,
            _poolWeight
        );
    }

    /**
     * @dev External function to set an asset and its corresponding pool
     * @notice This function can only be called by the contract owner
     * @param _asset The address of the asset
     * @param _pool The address of the Balancer pool
     */
    function _setAssetWeightPool(address _asset, address _pool)
        external
        onlyOwner
    {
        _setAssetWeightPoolInternal(_asset, _pool);
    }

    /**
     * @dev External function to set multiple assets and their corresponding pools in batch
     * @notice This function can only be called by the contract owner
     * @param _assets An array of asset addresses
     * @param _pools An array of Balancer pool addresses corresponding to the assets
     */
    function _setAssetWeightPoolBatch(
        address[] calldata _assets,
        address[] calldata _pools
    ) external virtual onlyOwner {
        require(
            _assets.length == _pools.length,
            "_setAssetWeightPoolBatch: `_assets` & `_pools` must match in length."
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _setAssetWeightPoolInternal(_assets[i], _pools[i]);
        }
    }

    /**
     * @dev Internal function to get the price of an asset.
     * @param _asset The address of the asset.
     * @return The price of the asset.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        AssetWeightPoolData storage _poolData = assetWeightPoolDatas_[_asset];

        if (_poolData.pool == address(0)) return 0;

        _balancerVaultNonReentrant();
        (, uint256[] memory _balances, ) = VAULT.getPoolTokens(
            _poolData.poolId
        );
        if (_balances[_poolData.tokenIndex] == 0) return 0;

        return
            (
                _balances[_poolData.priceTokenIndex]
                .mul(IOracle(owner).getUnderlyingPrice(_poolData.priceToken))
                .mul(_poolData.poolWeight)
            ) / (_balances[_poolData.tokenIndex].mul(BASE));
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
     * @notice Retrieves the weight pool data for a given asset
     * @dev This function returns all the stored data for an asset's weight pool
     * @param _asset The address of the asset to query
     * @return _pool The address of the pool
     * @return _priceToken The address of the price token
     * @return _poolId The unique identifier of the pool
     * @return _tokenIndex The index of the token in the pool
     * @return _priceTokenIndex The index of the price token in the pool
     * @return _poolWeight The weight of the pool
     */
    function assetWeightPoolData(address _asset)
        external
        view
        returns (
            address _pool,
            address _priceToken,
            bytes32 _poolId,
            uint256 _tokenIndex,
            uint256 _priceTokenIndex,
            uint256 _poolWeight
        )
    {
        AssetWeightPoolData storage _poolData = assetWeightPoolDatas_[_asset];
        _pool = _poolData.pool;
        _priceToken = _poolData.priceToken;
        _poolId = _poolData.poolId;
        _tokenIndex = _poolData.tokenIndex;
        _priceTokenIndex = _poolData.priceTokenIndex;
        _poolWeight = _poolData.poolWeight;
    }
}
