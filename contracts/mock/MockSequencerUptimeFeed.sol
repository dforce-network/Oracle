// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

contract MockSequencerUptimeFeed {
    /// @dev Chainlink layer2 sequencer grace period time.
    uint256 public gracePeriodTime = 2 hours;

    function _setGracePeriodTime(uint256 _gracePeriodTime) public {
        gracePeriodTime = _gracePeriodTime;
    }

    function latestRoundData()
        public
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        roundId;
        answer;
        startedAt = block.timestamp - gracePeriodTime;
        updatedAt = startedAt;
        answeredInRound;
    }
}
