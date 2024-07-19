// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/lib/contracts/libraries/FixedPoint.sol";
import "@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol";

import "../interface/IOracle.sol";

import "./base/Base.sol";
import "./base/Unit.sol";

contract UniV2Model is Base, Unit {
    using FixedPoint for *;

    /// @dev Mapping of asset addresses to pairs.
    mapping(address => address) internal pairs_;

    struct PairData {
        bool isToken0;
        address pairToken;
        uint256 timestamp;
        uint256 priceCumulative;
    }

    ///
    mapping(address => PairData) public pairData_;

    /// @dev Emitted when `pairs_` is changed.
    event SetAssetPair(address asset, address pairs);

    /**
     * @notice Set `pair` for asset to the specified address.
     * @dev Owner function to change the pair.
     * @param _asset Asset for which to set the `pair`.
     * @param _pair Pair to assign for `asset`.
     */
    function _setAssetPair(address _asset, address _pair)
        public
        virtual
        onlyOwner
    {
        require(
            _pair != address(0),
            "_setAssetPair: Pair cannot be the zero address."
        );

        address _oldAssetPair = pairs_[_asset];
        require(
            _pair != _oldAssetPair,
            "_setAssetPair: Old and new address cannot be the same."
        );

        address _token0 = IUniswapV2Pair(_pair).token0();
        address _token1 = IUniswapV2Pair(_pair).token1();
        bool _isToken0 = _token0 == _asset;
        address _pairToken = _isToken0 ? _token1 : _token0;

        require(
            _isToken0 || _token1 == _asset,
            "_setAssetPair: asset is not in the pair"
        );

        require(
            IOracle(owner).getUnderlyingPrice(_pairToken) > 0,
            "_setAssetPair: other pair token price unavailable!"
        );

        pairs_[_asset] = _pair;

        pairData_[_asset].isToken0 = _isToken0;
        pairData_[_asset].pairToken = _pairToken;

        refreshPairData(_asset);

        emit SetAssetPair(_asset, _pair);
    }

    /**
     * @notice Set `pair` for assets to the specified addresses.
     * @dev Owner function to change pairs.
     * @param _assets Assets for which to set the `pair`.
     * @param _pairs Pairs to assign for `assets`.
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
            _setAssetPair(_assets[i], _pairs[i]);
        }
    }

    /**
     * @notice Set the asset’s `pair` to disabled.
     * @dev Owner function to disable a pair.
     * @param _asset Asset for which to disable the `pair`.
     */
    function _disableAssetPair(address _asset) public virtual onlyOwner {
        require(
            pairs_[_asset] != address(0),
            "_disableAssetPair: The pair is already disabled!"
        );

        delete pairs_[_asset];
        emit SetAssetPair(_asset, address(0));
    }

    /**
     * @notice Disable `pair` for assets to the specified addresses.
     * @dev Owner function to disable pairs.
     * @param _assets Assets for which to disable the `pair`.
     */
    function _disableAssetPairBatch(address[] calldata _assets)
        external
        virtual
        onlyOwner
    {
        for (uint256 i = 0; i < _assets.length; i++) {
            _disableAssetPair(_assets[i]);
        }
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return _twap the TWAP price.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        PairData storage _pairData = pairData_[_asset];

        (
            uint256 _price0Cumulative,
            uint256 _price1Cumulative,

        ) = UniswapV2OracleLibrary.currentCumulativePrices(pairs_[_asset]);

        uint256 _priceCumulativeEnd = _pairData.isToken0
            ? _price0Cumulative
            : _price1Cumulative;
        uint256 _priceCumulativeStart = _pairData.priceCumulative;
        uint256 _timeElapsed = block.timestamp.sub(_pairData.timestamp);

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
                .mul(IOracle(owner).getUnderlyingPrice(_pairData.pairToken))
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
     * @notice Asset pair.
     * @dev Get asset pair.
     * @param _asset Asset address.
     * @return asset pair address.
     */
    function pair(address _asset) external view returns (address) {
        return pairs_[_asset];
    }

    /**
     * @notice refresh asset pair data.
     * @param _asset Asset address.
     */
    function refreshPairData(address _asset) public {
        PairData storage _pairData = pairData_[_asset];

        (
            uint256 _price0Cumulative,
            uint256 _price1Cumulative,

        ) = UniswapV2OracleLibrary.currentCumulativePrices(pairs_[_asset]);

        _pairData.priceCumulative = (
            _pairData.isToken0 ? _price0Cumulative : _price1Cumulative
        );

        _pairData.timestamp = block.timestamp;
    }
}
