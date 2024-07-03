// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IsUSX {
    function lastEpochId() external view returns (uint256);

    function usrConfigsLength() external view returns (uint256);

    function currentRate() external view returns (uint256);
}
