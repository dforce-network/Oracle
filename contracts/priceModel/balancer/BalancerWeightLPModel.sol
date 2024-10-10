// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./BalancerBase.sol";
import "./BalancerMath.sol";

import "../../library/SafeRatioMath.sol";

import "../../interface/IOracle.sol";

/// @title BalancerWeightLPModel
/// @notice A contract for modeling Balancer weighted liquidity pool prices
/// @dev Inherits from BalancerBase and BalancerMath
contract BalancerWeightLPModel is BalancerBase, BalancerMath {
    using SafeRatioMath for uint256;

    /// @dev Constant for base decimals, set to 18
    uint256 internal constant BASE_DECIMALS = 18;

    /// @dev Struct to store data for weighted pools
    struct WeightPoolData {
        bytes32 poolId;
        address token;
        address priceToken;
        uint256 tokenIndex;
        uint256 priceTokenIndex;
        uint256 tokenWeight;
        uint256 priceTokenWeight;
    }

    /// @dev Mapping of pool addresses to their WeightPoolData
    mapping(address => WeightPoolData) internal weightPoolDatas_;

    /// @dev Event emitted when a weighted pool is set
    event SetWeightPool(
        address pool,
        bytes32 poolId,
        address token,
        address priceToken,
        uint256 tokenIndex,
        uint256 priceTokenIndex,
        uint256 tokenWeight,
        uint256 priceTokenWeight
    );

    /**
     * @dev Constructor to initialize the BalancerWeightLPModel contract
     * @param _vault Address of the Balancer Vault
     * @notice This constructor calls the BalancerBase constructor with the provided vault address
     * @notice It sets up the initial state for the BalancerWeightLPModel contract
     */
    constructor(IVault _vault) public BalancerBase(_vault) {}

    /**
     * @dev Internal function to set up a weighted pool
     * @param _pool Address of the weighted pool
     * @param _token Address of the token in the pool
     */
    function _setWeightPoolInternal(address _pool, address _token)
        internal
        virtual
    {
        require(
            IWeightedPool(_pool).getVault() == VAULT,
            "_setWeightPoolInternal: Invalid pool address!"
        );

        WeightPoolData storage _weightPoolData = weightPoolDatas_[_pool];
        bytes32 _poolId = IWeightedPool(_pool).getPoolId();
        require(
            _poolId != _weightPoolData.poolId,
            "_setWeightPoolInternal: Old and new pool ID cannot be the same!"
        );

        (IERC20[] memory _tokens, , ) = VAULT.getPoolTokens(_poolId);
        (uint256 _tokenIndex, uint256 _priceTokenIndex) = _token ==
            address(_tokens[0])
            ? (0, 1)
            : (1, 0);
        require(
            _token == address(_tokens[_tokenIndex]),
            "_setWeightPoolInternal: `_token` is not in the pool!"
        );

        address _priceToken = address(_tokens[_priceTokenIndex]);
        require(
            IOracle(owner).getUnderlyingPrice(_priceToken) > 0,
            "_setWeightPoolInternal: Another token price is unavailable!"
        );

        uint256[] memory _weights = IWeightedPool(_pool).getNormalizedWeights();

        _weightPoolData.poolId = _poolId;
        _weightPoolData.token = _token;
        _weightPoolData.priceToken = _priceToken;
        _weightPoolData.tokenIndex = _tokenIndex;
        _weightPoolData.priceTokenIndex = _priceTokenIndex;
        _weightPoolData.tokenWeight = _weights[_tokenIndex];
        _weightPoolData.priceTokenWeight = _weights[_priceTokenIndex];

        emit SetWeightPool(
            _pool,
            _poolId,
            _token,
            _priceToken,
            _tokenIndex,
            _priceTokenIndex,
            _weights[_tokenIndex],
            _weights[_priceTokenIndex]
        );
    }

    /**
     * @dev External function to set an asset and its corresponding pair
     * @notice This function can only be called by the contract owner
     * @param _token The address of the token to be set
     * @param _pool The address of the pool associated with the token
     */
    function _setWeightPool(address _pool, address _token) external onlyOwner {
        _setWeightPoolInternal(_pool, _token);
    }

    /**
     * @dev External function to set multiple tokens and their corresponding pairs in batch
     * @notice This function can only be called by the contract owner
     * @notice It allows for efficient setting of multiple token-pool pairs at once
     * @param _tokens An array of token addresses to be set
     * @param _pools An array of pool addresses corresponding to the tokens
     */
    function _setWeightPoolBatch(
        address[] calldata _pools,
        address[] calldata _tokens
    ) external virtual onlyOwner {
        require(
            _pools.length == _tokens.length,
            "_setWeightPoolBatch: `_pools` & `_tokens` must match in length."
        );
        for (uint256 i = 0; i < _pools.length; i++) {
            _setWeightPoolInternal(_pools[i], _tokens[i]);
        }
    }

    /**
     * @dev Calculates the fair balance for two tokens in a weighted pool
     * @param _balanceA The balance of token A
     * @param _balanceB The balance of token B
     * @param _weightA The weight of token A
     * @param _weightB The weight of token B
     * @param _decimalPriceA The decimal-adjusted price of token A
     * @param _decimalPriceB The decimal-adjusted price of token B
     * @return The fair balances for token A and token B
     */
    function _calculateFairBalance(
        uint256 _balanceA,
        uint256 _balanceB,
        uint256 _weightA,
        uint256 _weightB,
        uint256 _decimalPriceA,
        uint256 _decimalPriceB
    ) internal pure returns (uint256, uint256) {
        uint256 _balanceRatio = bdiv(_balanceA, _balanceB);
        uint256 _weightValue = bdiv(
            bmul(_weightA, _decimalPriceB),
            bmul(_weightB, _decimalPriceA)
        );

        uint256 _ratio;
        if (_balanceRatio > _weightValue) {
            _ratio = bdiv(_weightValue, _balanceRatio);
            return (
                bmul(_balanceA, bpow(_ratio, _weightB)),
                bdiv(_balanceB, bpow(_ratio, _weightA))
            );
        }

        _ratio = bdiv(_balanceRatio, _weightValue);
        return (
            bdiv(_balanceA, bpow(_ratio, _weightB)),
            bmul(_balanceB, bpow(_ratio, _weightA))
        );
    }

    /**
     * @dev Calculates the price of a Balancer weighted LP token
     * @param _pool Address of the Balancer pool
     * @return The calculated price of the LP token
     */
    function _calculateLpPrice(address _pool) internal returns (uint256) {
        WeightPoolData storage _weightPoolData = weightPoolDatas_[_pool];
        if (_weightPoolData.poolId == bytes32(0)) return 0;

        _balancerVaultNonReentrant();

        uint256 _lpTotalSupply = IAsset(_pool).totalSupply();
        if (_lpTotalSupply == 0) return 0;

        uint256 _priceA = IOracle(owner).getUnderlyingPrice(
            _weightPoolData.token
        );
        uint256 _priceB = IOracle(owner).getUnderlyingPrice(
            _weightPoolData.priceToken
        );

        (, uint256[] memory _balances, ) = VAULT.getPoolTokens(
            _weightPoolData.poolId
        );

        (uint256 _fairBalanceA, uint256 _fairBalanceB) = _calculateFairBalance(
            _balances[_weightPoolData.tokenIndex],
            _balances[_weightPoolData.priceTokenIndex],
            _weightPoolData.tokenWeight,
            _weightPoolData.priceTokenWeight,
            _priceA.div(
                10 **
                    (
                        BASE_DECIMALS.sub(
                            uint256(IAsset(_weightPoolData.token).decimals())
                        )
                    )
            ),
            _priceB.div(
                10 **
                    (
                        BASE_DECIMALS.sub(
                            uint256(
                                IAsset(_weightPoolData.priceToken).decimals()
                            )
                        )
                    )
            )
        );

        return
            (_fairBalanceA.mul(_priceA).add(_fairBalanceB.mul(_priceB))) /
            _lpTotalSupply;
    }

    /**
     * @dev Internal function to get the price of a Balancer LP token
     * @param _pool Address of the Balancer pool
     * @return The price of the LP token
     */
    function _getLpPrice(address _pool) internal returns (uint256) {
        WeightPoolData storage _weightPoolData = weightPoolDatas_[_pool];
        if (_weightPoolData.poolId == bytes32(0)) return 0;

        _balancerVaultNonReentrant();

        uint256 _lpTotalSupply = IAsset(_pool).totalSupply();
        if (_lpTotalSupply == 0) return 0;

        (, uint256[] memory _balances, ) = VAULT.getPoolTokens(
            _weightPoolData.poolId
        );

        return
            _balances[_weightPoolData.priceTokenIndex]
                .mul(
                IOracle(owner).getUnderlyingPrice(_weightPoolData.priceToken)
            ).rdiv(_weightPoolData.priceTokenWeight.mul(_lpTotalSupply));
    }

    /**
     * @dev Internal function to get the price of an asset.
     * @param _asset The address of the asset.
     * @return The price of the asset.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        // return _calculateLpPrice(_asset);
        return _getLpPrice(_asset);
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
     * @notice Retrieves the weight pool data for a given pool address
     * @dev This function returns all the stored data for a specific Balancer weighted pool
     * @param _pool The address of the Balancer weighted pool
     * @return _poolId The unique identifier of the pool
     * @return _token The address of the main token in the pool
     * @return _priceToken The address of the token used for pricing
     * @return _tokenIndex The index of the main token in the pool
     * @return _priceTokenIndex The index of the price token in the pool
     * @return _tokenWeight The weight of the main token in the pool
     * @return _priceTokenWeight The weight of the price token in the pool
     */
    function weightPoolData(address _pool)
        external
        view
        returns (
            bytes32 _poolId,
            address _token,
            address _priceToken,
            uint256 _tokenIndex,
            uint256 _priceTokenIndex,
            uint256 _tokenWeight,
            uint256 _priceTokenWeight
        )
    {
        WeightPoolData storage _weightPoolData = weightPoolDatas_[_pool];
        _poolId = _weightPoolData.poolId;
        _token = _weightPoolData.token;
        _priceToken = _weightPoolData.priceToken;
        _tokenIndex = _weightPoolData.tokenIndex;
        _priceTokenIndex = _weightPoolData.priceTokenIndex;
        _tokenWeight = _weightPoolData.tokenWeight;
        _priceTokenWeight = _weightPoolData.priceTokenWeight;
    }

    function calculateLpPrice(address _pool) external returns (uint256) {
        return _calculateLpPrice(_pool);
    }

    function getLpPrice(address _pool) external returns (uint256) {
        return _getLpPrice(_pool);
    }
}
