// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

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
     * @return the fair lp price.
     */
    function _getAssetPrice(address _asset) internal virtual returns (uint256) {
        uint256 _totalSupply = IUniswapV2Pair(_asset).totalSupply();

        if (_totalSupply == 0) return 0;

        address _token0 = IUniswapV2Pair(_asset).token0();
        address _token1 = IUniswapV2Pair(_asset).token1();
        (uint256 _r0, uint256 _r1, ) = IUniswapV2Pair(_asset).getReserves();

        uint256 _sqrtK = SqrtMath.sqrt(_r0.mul(_r1)).rdiv(_totalSupply); // in 1e18
        uint256 _p0 = IOracle(owner).getUnderlyingPrice(_token0); // in 1e18
        uint256 _p1 = IOracle(owner).getUnderlyingPrice(_token1); // in 1e18

        return _sqrtK.mul(2).mul(SqrtMath.sqrt(_p0)).rmul(SqrtMath.sqrt(_p1));
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
}
