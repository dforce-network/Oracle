// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../PosterHeartbeatModel.sol";
import "../status/ChainlinkSequencerStatus.sol";

contract Layer2PosterHeartbeatModel is
    PosterHeartbeatModel,
    ChainlinkSequencerStatus
{
    /**
     * @notice Only for the implementation contract, as for the proxy pattern,
     *            should call `initialize()` separately.
     * @param _sequencerUptimeFeed The address of the Chainlink sequencer.
     */
    constructor(IChainlinkAggregator _sequencerUptimeFeed) public Base() {
        _setChainlinkSequencer(_sequencerUptimeFeed);
    }

    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        override
        returns (bool)
    {
        return
            PosterHeartbeatModel._getAssetStatus(_asset) && _sequencerStatus();
    }
}
