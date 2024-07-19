//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IOracle {
    function getUnderlyingPrice(address _asset)
        external
        returns (uint256 _price);
}
