// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../PosterHeartbeatModel.sol";
import "../status/ArbitrumSequencerStatus.sol";

contract ArbitrumPosterHeartbeatModel is
    PosterHeartbeatModel,
    ArbitrumSequencerStatus
{
    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        override
        returns (bool)
    {
        return
            PosterHeartbeatModel._getAssetStatus(_asset) && !_sequencerStatus();
    }
}
