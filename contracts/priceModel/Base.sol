// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../library/Initializable.sol";
import "../library/Ownable.sol";

abstract contract Base is
    Initializable,
    Ownable
{

    constructor() public {
        initialize();
    }

    /**
     * @notice Do not pay into PriceModel.
     */
    receive() external payable {
        revert();
    }

    /**
     * @dev Initialize contract to set some configs.
     */
    function initialize() public virtual initializer {
        __Ownable_init();
    }
}