// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../ReaderPosterHeartbeatModel.sol";
import "../status/ChainlinkSequencerStatus.sol";

contract Layer2ReaderPosterHeartbeatModel is
    ReaderPosterHeartbeatModel,
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

    /**
     * @dev Set price for an asset.
     * @param _asset Asset address.
     * @return Boolean ture:success, false:fail.
     */
    function _getAssetStatus(address _asset)
        internal
        view
        virtual
        override
        returns (bool)
    {
        return
            ReaderPosterHeartbeatModel._getAssetStatus(_asset) &&
            _sequencerStatus();
    }
}
