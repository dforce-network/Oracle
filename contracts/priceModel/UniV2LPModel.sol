// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "./base/Base.sol";
import "./base/Unit.sol";

import "../interface/IOracle.sol";

import "../library/SqrtMath.sol";
import "../library/SafeRatioMath.sol";

contract UniV2LPModel is Base, Unit {
    using SafeRatioMath for uint256;

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return the fair lp price and status.
     */
    function _getAssetPrice(address _asset)
        internal
        virtual
        returns (uint256, bool)
    {
        uint256 _totalSupply = IUniswapV2Pair(_asset).totalSupply();

        if (_totalSupply == 0) return (0, false);

        address _token0 = IUniswapV2Pair(_asset).token0();
        address _token1 = IUniswapV2Pair(_asset).token1();
        (uint256 _r0, uint256 _r1, ) = IUniswapV2Pair(_asset).getReserves();

        uint256 _sqrtK = SqrtMath.sqrt(_r0.mul(_r1)).rdiv(_totalSupply); // in 1e18
        (uint256 _p0, bool _s0) = IOracle(owner).getUnderlyingPriceAndStatus(
            _token0
        ); // in 1e18
        (uint256 _p1, bool _s1) = IOracle(owner).getUnderlyingPriceAndStatus(
            _token1
        ); // in 1e18

        return (
            _sqrtK.mul(2).mul(SqrtMath.sqrt(_p0)).rmul(SqrtMath.sqrt(_p1)),
            _s0 && _s1
        );
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return _price Asset price.
     */
    function getAssetPrice(address _asset)
        external
        virtual
        override
        returns (uint256 _price)
    {
        (_price, ) = _getAssetPrice(_asset);
    }

    /**
     * @dev Get asset price status.
     * @return _status Asset price status.
     */
    function getAssetStatus(address _asset)
        external
        virtual
        override
        returns (bool _status)
    {
        (, _status) = _getAssetPrice(_asset);
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
        return _getAssetPrice(_asset);
    }
}
