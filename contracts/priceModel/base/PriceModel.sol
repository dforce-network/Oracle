// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../../interface/IPriceModel.sol";

abstract contract PriceModel is IPriceModel {
    using SafeMath for uint256;

    uint256 internal constant doubleDecimals_ = 36;

    bool public constant override isPriceModel = true;

    function _calcDecimal(
        uint256 _assetDecimals,
        uint256 _priceDecimals,
        uint256 _price
    ) internal pure virtual returns (uint256) {
        return
            _price.mul(
                10**(doubleDecimals_.sub(_assetDecimals.add(_priceDecimals)))
            );
    }
}
