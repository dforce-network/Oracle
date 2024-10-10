// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
// pragma experimental ABIEncoderV2;

import "../base/Base.sol";
import "../base/Unit.sol";

import "./IBalancer.sol";

/**
 * @title BalancerBase
 * @dev Abstract contract that serves as a base for Balancer-related contracts
 * @notice Inherits from Base and Unit contracts
 */
abstract contract BalancerBase is Base, Unit {
    /// @dev The immutable reference to the Balancer Vault contract
    IVault internal immutable VAULT;

    /// @dev The immutable reference to the Wrapped Ether (WETH) contract
    IWETH internal immutable WETH;

    /**
     * @dev Constructor to initialize the BalancerBase contract
     * @param _vault Address of the Balancer Vault
     */
    constructor(IVault _vault) public Base() {
        VAULT = _vault;
        WETH = _vault.WETH();
    }

    /**
     * @dev Internal function to check if the Balancer Vault is not in a reentrant state
     * @notice This function performs a static call to the Vault to ensure it's not being reentered
     */
    function _balancerVaultNonReentrant() internal view virtual {
        // IVault.UserBalanceOp[] memory _noop = new IVault.UserBalanceOp[](0);
        // VAULT.manageUserBalance(_noop);

        (, bytes memory _revertData) = address(VAULT).staticcall{ gas: 10_000 }(
            abi.encodeWithSelector(VAULT.manageUserBalance.selector, 0)
        );

        require(
            _revertData.length == 0,
            "_balancerVaultNonReentrant: Balancer Vault Exception!"
        );
    }

    /**
     * @dev Returns the Vault contract.
     * @notice This function provides external access to the immutable VAULT variable.
     * @return IVault The Balancer Vault contract instance.
     */
    function vault() external view returns (IVault) {
        return VAULT;
    }

    /**
     * @dev Returns the WETH contract.
     * @notice This function provides external access to the immutable WETH variable.
     * @return IWETH The Wrapped Ether (WETH) contract instance.
     */
    function weth() external view returns (IWETH) {
        return WETH;
    }
}
