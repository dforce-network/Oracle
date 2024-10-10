//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract BalancerMath {
    using SafeMath for uint256;

    uint256 private constant ONE = 10**18;

    uint256 private constant MIN_BPOW_BASE = 1 wei;
    uint256 private constant MAX_BPOW_BASE = (2 * ONE) - 1 wei;
    uint256 private constant BPOW_PRECISION = ONE / 10**10;

    function roundDown(uint256 a) internal pure returns (uint256) {
        return (a / ONE) * ONE;
    }

    function absSign(uint256 a, uint256 b)
        internal
        pure
        returns (uint256, bool)
    {
        if (a >= b) {
            return (a - b, false);
        } else {
            return (b - a, true);
        }
    }

    function bmul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a.mul(b).add(ONE / 2) / ONE;
    }

    function bdiv(uint256 a, uint256 b) internal pure returns (uint256) {
        return a.mul(ONE).add(b / 2).div(b);
    }

    function bpowi(uint256 a, uint256 n) internal pure returns (uint256) {
        uint256 z = n % 2 != 0 ? a : ONE;

        for (n /= 2; n != 0; n /= 2) {
            a = bmul(a, a);

            if (n % 2 != 0) {
                z = bmul(z, a);
            }
        }
        return z;
    }

    function bpow(uint256 base, uint256 exp) internal pure returns (uint256) {
        require(base >= MIN_BPOW_BASE, "ERR_BPOW_BASE_TOO_LOW");
        require(base <= MAX_BPOW_BASE, "ERR_BPOW_BASE_TOO_HIGH");

        uint256 whole = roundDown(exp);
        uint256 remain = exp.sub(whole);

        uint256 wholePow = bpowi(base, whole / ONE);

        if (remain == 0) {
            return wholePow;
        }

        uint256 partialResult = bpowApprox(base, remain, BPOW_PRECISION);
        return bmul(wholePow, partialResult);
    }

    function bpowApprox(
        uint256 base,
        uint256 exp,
        uint256 precision
    ) internal pure returns (uint256) {
        uint256 a = exp;
        (uint256 x, bool xneg) = absSign(base, ONE);
        uint256 term = ONE;
        uint256 sum = term;
        bool negative = false;

        for (uint256 i = 1; term >= precision; i++) {
            uint256 bigK = i * ONE;
            (uint256 c, bool cneg) = absSign(a, bigK.sub(ONE));
            term = bmul(term, bmul(c, x));
            term = bdiv(term, bigK);
            if (term == 0) break;

            if (xneg) negative = !negative;
            if (cneg) negative = !negative;
            if (negative) {
                sum = sum.sub(term);
            } else {
                sum = sum.add(term);
            }
        }

        return sum;
    }
}
