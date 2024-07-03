// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../library/SafeRatioMath.sol";
import "./interface/IsUSX.sol";

/**
 * @title sUSXExchangeRateAggregator
 * @dev This contract is used to aggregate the exchange rate of sUSX.
 */
contract sUSXExchangeRateAggregator {
    using SafeRatioMath for uint256;

    uint256 internal constant RAY = 10**27;

    IsUSX internal immutable SUSX;

    /**
     * @dev Constructor function to initialize the sUSX contract.
     * @param _sUSX The address of the sUSX contract.
     */
    constructor(IsUSX _sUSX) public {
        require(
            _sUSX.lastEpochId() <= _sUSX.usrConfigsLength(),
            "_sUSX is invalid"
        );
        SUSX = _sUSX;
    }

    /**
     * @notice Retrieves the current answer from the aggregator delegated to.
     * @return roundId The round ID from the aggregator for which the data was
     * retrieved, combined with a phase to ensure that round IDs increase as
     * time moves forward.
     * @return answer The answer for the given round.
     * @return startedAt The timestamp when the round was started.
     * (Only some AggregatorV3Interface implementations return meaningful values)
     * @return updatedAt The timestamp when the round last was updated (i.e.
     * answer was last computed).
     * @return answeredInRound The round ID of the round in which the answer
     * was computed.
     */
    function _latestRoundData()
        internal
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // Calculate the answer by dividing the current rate by the RAY constant.
        answer = int256(SUSX.currentRate().rdiv(RAY));
        roundId;
        answeredInRound;
        // Set startedAt and updatedAt to the current block timestamp.
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
    }

    /**
     * @notice This function reads the current answer from the aggregator that is delegated to.
     * @dev This function calls the internal function `_latestRoundData` to get the latest round data.
     * @return roundId The round ID from the aggregator for which the data was retrieved, combined with a phase to ensure that round IDs increase as time moves forward.
     * @return answer The answer for the given round.
     * @return startedAt The timestamp when the round was started.
     * (Only some AggregatorV3Interface implementations return meaningful values)
     * @return updatedAt The timestamp when the round was last updated (i.e. when the answer was last computed).
     * @return answeredInRound The round ID of the round in which the answer was computed.
     */
    function latestRoundData()
        external
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        return _latestRoundData();
    }

    /**
     * @notice represents the number of decimals the aggregator responses represent.
     * @return The decimal point of the aggregator.
     */
    function decimals() external pure returns (uint8) {
        return 18;
    }

    /**
     * @notice the version number representing the type of aggregator the proxy points to.
     * @return The aggregator version is uint256(-1).
     */
    function version() external pure returns (uint256) {
        return 1;
    }

    /**
     * @notice This function returns the current sUSX instance.
     * @return The sUSX instance.
     */
    function sUSX() external view returns (IsUSX) {
        return SUSX;
    }
}
