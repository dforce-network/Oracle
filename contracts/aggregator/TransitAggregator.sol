// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "./Aggregator.sol";

import "../interface/IChainlinkAggregator.sol";

contract TransitAggregator is Aggregator {
    using SignedSafeMath for int256;

    IChainlinkAggregator internal immutable assetAggregator_;
    IChainlinkAggregator internal immutable transitAggregator_;

    constructor(
        IChainlinkAggregator _assetAggregator,
        IChainlinkAggregator _transitAggregator
    ) public {
        assetAggregator_ = _assetAggregator;
        transitAggregator_ = _transitAggregator;
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
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (
            ,
            int256 _assetAggregatorPrice,
            ,
            uint256 _assetAggregatorUpdatedAt,

        ) = assetAggregator_.latestRoundData();
        (
            ,
            int256 _transitPrice,
            ,
            uint256 _transitUpdatedAt,

        ) = transitAggregator_.latestRoundData();
        int256 _scale = int256(10**uint256(transitAggregator_.decimals()));
        if (_assetAggregatorPrice > 0 && _transitPrice > 0 && _scale > 0)
            answer = _assetAggregatorPrice.mul(_transitPrice).div(_scale);

        startedAt = _assetAggregatorUpdatedAt > _transitUpdatedAt
            ? _assetAggregatorUpdatedAt
            : _transitUpdatedAt;
        updatedAt = startedAt;
        roundId;
        answeredInRound;
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
     *         Transit aggregator address
     */
    function getAggregators()
        external
        view
        returns (IChainlinkAggregator, IChainlinkAggregator)
    {
        return (assetAggregator_, transitAggregator_);
    }

    /**
     * @notice returns the description of the aggregator the proxy points to.
     */
    function description()
        external
        view
        returns (string memory, string memory)
    {
        return (
            assetAggregator_.description(),
            transitAggregator_.description()
        );
    }
}
