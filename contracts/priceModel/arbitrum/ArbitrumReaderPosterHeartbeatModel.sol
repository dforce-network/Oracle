// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../ReaderPosterHeartbeatModel.sol";
import "../status/ArbitrumSequencerStatus.sol";

contract ArbitrumReaderPosterHeartbeatModel is
    ReaderPosterHeartbeatModel,
    ArbitrumSequencerStatus
{
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
        return _getAssetStatus(_asset) && !_sequencerStatus();
    }
}
