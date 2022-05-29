// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;


import "../PriceModel.sol";
import "../../interface/IChainlinkAggregator.sol";

contract ChainLinkPrice is PriceModel {

    /**
     * @dev Mapping of asset addresses to aggregator.
     */
    mapping(address => address) internal aggregator_;

    /**
     * @dev Emitted for asset aggregator changes.
     */
    event SetAssetAggregator(address asset, address aggregator);


    /**
     * @notice Set `aggregator` for asset to the specified address.
     * @dev Admin function to change of aggregator.
     * @param _asset Asset for which to set the `aggregator`.
     * @param _aggregator Address to assign to `aggregator`.
     */
    function _setAssetAggregator(address _asset, address _aggregator)
        public
        virtual
        onlyOwner
    {
        require(
            IChainlinkAggregator(_aggregator).version() >= 0,
            "_setAssetAggregator: This is not the chainlink aggregator contract!"
        );

        address _oldAssetAggregator = aggregator_[_asset];
        require(
            _aggregator != _oldAssetAggregator,
            "_setAssetAggregator: Old and new address cannot be the same."
        );

        aggregator_[_asset] = _aggregator;
        emit SetAssetAggregator(_asset, _aggregator);
    }

    function _setAssetAggregatorBatch(
        address[] calldata _assets,
        address[] calldata _aggregators
    ) external virtual {
        require(
            _assets.length == _aggregators.length,
            "_setAssetAggregatorBatch: assets & aggregators must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setAssetAggregator(_assets[i], _aggregators[i]);
    }

    /**
     * @notice Set the asset’s `aggregator` to disabled.
     * @dev Admin function to disable of aggregator.
     * @param _asset Asset for which to disable the `aggregator`.
     */
    function _disableAssetAggregator(address _asset)
        public
        virtual
        onlyOwner
    {
        require(
            _getAssetPrice(_asset) > 0,
            "_disableAssetAggregator: The price of local assets cannot be 0!"
        );

        delete aggregator_[_asset];
        emit SetAssetAggregator(_asset, aggregator_[_asset]);
    }

    function _disableAssetAggregatorBatch(address[] calldata _assets) external {
        for (uint256 i = 0; i < _assets.length; i++)
            _disableAssetAggregator(_assets[i]);
    }

    function _setPrice(address _asset, uint256 _requestedPrice) external override virtual returns (uint256) {
        _asset;
        _requestedPrice;
        return 0;
    }

    function _getAssetPrice(address _asset) internal virtual view returns (uint256) {
        IChainlinkAggregator _aggregator = IChainlinkAggregator(aggregator_[_asset]);
        (, int256 _answer, , ,) = _aggregator.latestRoundData();
        return _calcDecimal(uint256(IERC20(_asset).decimals()) , uint256(_aggregator.decimals()), uint256(_answer));
    }

    function getAssetPrice(address _asset) external override virtual returns (uint256) {
        return _getAssetPrice(_asset);
    }
    function getAssetStatus(address _asset) external override virtual returns (bool) {
        _asset;
        return true;
    }
    function getAssetPriceStatus(address _asset) external override virtual returns (uint256, bool) {
        return (_getAssetPrice(_asset), true);
    }

    function aggregator(address _asset) external view returns (address) {
        return aggregator_[_asset];
    }
}