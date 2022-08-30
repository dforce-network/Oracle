// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

/**
 * @title dForce's AggregatorModelV2 Contract
 * @author dForce
 * @notice The aggregator model is a reorganization of the third-party price oracle,
 *          so it can be applied to the priceOracle contract price system
 */
abstract contract Aggregator {
    /**
     * @notice Read the price of the asset from the delegate aggregator.
     */
    function latestRoundData()
        external
        view
        virtual
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        );

    /**
     * @notice represents the number of decimals the aggregator responses represent.
     */
    // function decimals() external view virtual returns (uint8);

    /**
     * @notice represents the number of decimals the aggregator responses represent.
     */
    function decimals() external view virtual returns (uint8);

    /**
     * @notice the version number representing the type of aggregator the proxy points to.
     */
    function version() external view virtual returns (uint256);
}
