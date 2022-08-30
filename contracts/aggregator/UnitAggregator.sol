// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "./Aggregator.sol";

import "../interface/IChainlinkAggregator.sol";

contract UnitAggregator is Aggregator {
    using SignedSafeMath for int256;

    IChainlinkAggregator internal immutable assetAggregator_;

    int256 internal constant BASE = 1 ether;
    int256 internal constant unit = 31103476800000000000;

    constructor(IChainlinkAggregator _assetAggregator) public {
        assetAggregator_ = _assetAggregator;
    }

    /**
     * @notice Reads the current answer from aggregator delegated to.
     * @return roundId is the round ID from the aggregator for which the data was
     * retrieved combined with a phase to ensure that round IDs get larger as
     * time moves forward.
     * @return answer is the answer for the given round
     * @return startedAt is the timestamp when the round was started.
     * (Only some AggregatorV3Interface implementations return meaningful values)
     * @return updatedAt is the timestamp when the round last was updated (i.e.
     * answer was last computed)
     * @return answeredInRound is the round ID of the round in which the answer
     * was computed.
     */
    function latestRoundData()
        external
        view
        virtual
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        ) = assetAggregator_.latestRoundData();
        if (answer > 0) answer = answer.mul(BASE).div(unit);
    }

    /**
     * @notice represents the number of decimals the aggregator responses represent.
     * @return The decimal point of the aggregator.
     */
    function decimals() external view virtual override returns (uint8) {
        return assetAggregator_.decimals();
    }

    /**
     * @notice the version number representing the type of aggregator the proxy points to.
     * @return The aggregator version is uint256(-1).
     */
    function version() external view virtual override returns (uint256) {
        return assetAggregator_.version();
    }

    /**
     * @dev Used to query the source address of the aggregator.
     * @return Asset aggregator address.
     */
    function assetAggregator() external view returns (IChainlinkAggregator) {
        return assetAggregator_;
    }

    /**
     * @notice returns the description of the aggregator the proxy points to.
     */
    function description() external view returns (string memory) {
        return assetAggregator_.description();
    }
}
