// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "../library/ERC20.sol";

/**
 * @title dForce's mock ERC20
 * @author dForce
 */
contract MockERC20 is ERC20 {
    /**
     * @notice Expects to call only once to initialize the ERC20 token.
     * @param _name Token name.
     * @param _symbol Token symbol.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public {
        __ERC20_init(_name, _symbol, _decimals);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burnFrom(from, amount);
    }
}
