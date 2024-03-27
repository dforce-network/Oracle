// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "./interface/ILending.sol";
import "./interface/IsaETH.sol";

contract saETHExchangeRateAggregator {
    using SignedSafeMath for int256;

    IController internal immutable CONTROLLER;
    address internal immutable IETH;
    IsaETH internal immutable SAETH;

    constructor(address _iETH, IsaETH _saETH) public {
        require(IiETH(_iETH).isiToken(), "_iETH is invalid");
        IETH = _iETH;
        CONTROLLER = IController(IiETH(_iETH).controller());
        SAETH = _saETH;
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
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (uint256 _price, bool _isPriceValid) = IPriceOracle(
            CONTROLLER.priceOracle()
        ).getUnderlyingPriceAndStatus(IETH);
        require(
            _price > 0 && _isPriceValid,
            "getUnderlyingPrice: price is invalid"
        );
        roundId;
        answeredInRound;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;

        answer = int256(_price).mul(int256(SAETH.convertToAssets(1 ether))).div(
            1 ether
        );
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

    function controller() external view returns (IController) {
        return CONTROLLER;
    }

    function iETH() external view returns (address) {
        return IETH;
    }

    /**
     * @notice returns saETH address.
     */
    function saETH() external view returns (IsaETH) {
        return SAETH;
    }
}
