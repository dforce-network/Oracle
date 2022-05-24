// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../library/Initializable.sol";
import "../library/Ownable.sol";

import "../interface/IPriceModel.sol";
import "../interface/IERC20.sol";

abstract contract PriceModel is
    Initializable,
    Ownable,
    IPriceModel
{

    using SafeMath for uint256;

    uint256 internal constant doubleDecimals = 36;

    bool public constant override isPriceModel = true;

    constructor() public {
        initialize();
    }

    /**
     * @dev Initialize contract to set some configs.
     */
    function initialize() public virtual initializer {
        __Ownable_init();
    }

    function _calcDecimal(uint256 _assetDecimals, uint256 _priceDecimals, uint256 _price) internal virtual pure returns (uint256) {

        return _price.mul(10 ** (doubleDecimals.sub(_assetDecimals.add(_priceDecimals))));
    }

    function getAssetPrice(address _asset) external override virtual returns (uint256);
    function getAssetStatus(address _asset) external override virtual returns (bool);
    function getAssetPriceStatus(address _asset) external override virtual returns (uint256, bool);

    function _setPrice(address _asset, uint256 _requestedPrice) external override virtual returns (uint256);
}