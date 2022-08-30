// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./TransitAggregator.sol";

contract UnitTransitAggregator is TransitAggregator {
    int256 internal constant BASE = 1 ether;
    int256 internal constant unit = 31103476800000000000;

    constructor(
        IChainlinkAggregator _assetAggregator,
        IChainlinkAggregator _transitAggregator
    ) public TransitAggregator(_assetAggregator, _transitAggregator) {}

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
        ) = _latestRoundData();
        if (answer > 0) answer = answer.mul(BASE).div(unit);
    }
}
