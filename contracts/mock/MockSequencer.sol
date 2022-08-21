// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

contract MockSequencer {
    /// @dev Chainlink flags address.
    bool public sequencerStatus;

    function _setSequencerStatus(bool _status) public {
        sequencerStatus = _status;
    }

    function getFlag(address _flagArbitrumSeqOffline)
        external
        view
        returns (bool)
    {
        _flagArbitrumSeqOffline;
        return sequencerStatus;
    }
}
