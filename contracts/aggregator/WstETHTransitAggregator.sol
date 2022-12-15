// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./TransitAggregator.sol";

import "./interface/IWstETH.sol";

contract WstETHTransitAggregator is TransitAggregator {
    using SignedSafeMath for int256;

    IWstETH internal immutable wstETH_;

    constructor(
        IWstETH _wstETH,
        IChainlinkAggregator _assetAggregator,
        IChainlinkAggregator _transitAggregator
    ) public TransitAggregator(_assetAggregator, _transitAggregator) {
        wstETH_ = _wstETH;
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
    function _latestRoundData()
        internal
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
        ) = TransitAggregator._latestRoundData();
        answer = answer.mul(int256(wstETH_.stEthPerToken())).div(1 ether);
    }

    /**
     * @notice returns wstETH address.
     */
    function wstETH() external view returns (IWstETH) {
        return wstETH_;
    }
}
