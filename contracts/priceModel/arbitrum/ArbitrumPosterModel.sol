// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../PosterModel.sol";
import "../status/ArbitrumSequencerStatus.sol";

contract ArbitrumPosterModel is PosterModel, ArbitrumSequencerStatus {
    function getAssetStatus(address _asset)
        external
        virtual
        override
        returns (bool)
    {
        _asset;
        return !_sequencerStatus();
    }

    function getAssetPriceStatus(address _asset)
        external
        virtual
        override
        returns (uint256, bool)
    {
        return (_getAssetPrice(_asset), !_sequencerStatus());
    }
}
