// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IsaETH {
    function deposit(uint256 _assets, address _receiver)
        external
        returns (uint256 _shares);

    function withdraw(
        uint256 _assets,
        address _receiver,
        address _owner
    ) external returns (uint256 _shares);

    function mint(uint256 shares, address receiver)
        external
        returns (uint256 assets);

    function redeem(
        uint256 _shares,
        address _receiver,
        address _owner
    ) external returns (uint256 _assets);

    function asset() external view returns (address assetTokenAddress);

    function totalAssets() external view returns (uint256 totalManagedAssets);

    function convertToShares(uint256 assets)
        external
        view
        returns (uint256 shares);

    function convertToAssets(uint256 shares)
        external
        view
        returns (uint256 assets);

    function maxDeposit(address receiver)
        external
        view
        returns (uint256 maxAssets);

    function previewDeposit(uint256 assets)
        external
        view
        returns (uint256 shares);

    function maxMint(address receiver)
        external
        view
        returns (uint256 maxShares);

    function previewMint(uint256 shares) external view returns (uint256 assets);

    function maxWithdraw(address owner)
        external
        view
        returns (uint256 maxAssets);

    function previewWithdraw(uint256 assets)
        external
        view
        returns (uint256 shares);

    function maxRedeem(address owner) external view returns (uint256 maxShares);

    function previewRedeem(uint256 shares)
        external
        view
        returns (uint256 assets);
}
