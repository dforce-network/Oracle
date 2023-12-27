// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "./base/Base.sol";
import "./base/Unit.sol";
import "./status/Heartbeat.sol";
import "../interface/IERC20.sol";

interface IExOraclePriceData {
    function latestRoundData(
        string calldata priceConfig,
        address dataSource
    )
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function get(
        string calldata priceConfig,
        address source
    ) external view returns (uint256 price, uint256 timestamp);

    function getOffchain(
        string calldata priceConfig,
        address source
    ) external view returns (uint256 price, uint256 timestamp);

    function getCumulativePrice(
        string calldata priceConfig,
        address source
    ) external view returns (uint256 cumulativePrice, uint32 timestamp);

    function lastResponseTime(address source) external view returns (uint256);
}

contract OKXX1Model is Base, Unit, Heartbeat {
    IExOraclePriceData public immutable exOracle;
    address public immutable dataSource;

    struct PriceConfig {
        string key;
        uint8 decimals;
    }

    /// @dev Mapping of asset addresses to priceConfigs.
    mapping(address => PriceConfig) internal priceConfigs_;

    /// @dev Emitted when `priceConfig` is changed.
    event SetAssetPriceConfig(address asset, string key, uint8 decimals);

    constructor(address _exOracle, address _dataSource) public {
        exOracle = IExOraclePriceData(_exOracle);
        dataSource = _dataSource;
    }

    /**
     * @notice Set `priceConfig` for asset to the specified address.
     * @dev Owner function to change of PriceConfig.
     * @param _asset Asset for which to set the `priceConfig`.
     * @param _key key to assign for `asset`, eg. BTC.
     * @param _decimals decimals to assign for `asset`.
     */
    function _setAssetPriceConfig(
        address _asset,
        string calldata _key,
        uint8 _decimals
    ) public virtual onlyOwner {
        priceConfigs_[_asset] = PriceConfig(_key, _decimals);
        emit SetAssetPriceConfig(_asset, _key, _decimals);
    }

    /**
     * @notice Set `keys` and `decimals` for assets to the specified addresses.
     * @dev Owner function to change of priceConfigs.
     * @param _assets Assets for which to set the `priceConfig`.
     * @param _keys keys to assign for `assets`.
     * @param _decimals decimals to assign for `assets`.
     */
    function _setAssetPriceConfigBatch(
        address[] calldata _assets,
        string[] calldata _keys,
        uint8[] calldata _decimals
    ) external virtual {
        require(
            _assets.length == _keys.length && _keys.length == _decimals.length,
            "_setAssetPriceConfigBatch: assets & priceConfigs must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setAssetPriceConfig(_assets[i], _keys[i], _decimals[i]);
    }

    /**
     * @notice Set the asset’s `priceConfig` to disabled.
     * @dev Owner function to disable of priceConfig.
     * @param _asset Asset for which to disable the `priceConfig`.
     */
    function _disableAssetPriceConfig(address _asset) public virtual onlyOwner {
        require(
            _getAssetPrice(_asset) > 0,
            "_disableAssetPriceConfig: The price of local assets cannot be 0!"
        );

        delete priceConfigs_[_asset];
        emit SetAssetPriceConfig(_asset, "", 0);
    }

    /**
     * @notice Disable `priceConfig` for assets to the specified addresses.
     * @dev Owner function to disable of priceConfigs.
     * @param _assets Assets for which to disable the `priceConfig`.
     */
    function _disableAssetPriceConfigBatch(
        address[] calldata _assets
    ) external {
        for (uint256 i = 0; i < _assets.length; i++)
            _disableAssetPriceConfig(_assets[i]);
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return Asset price.
     */
    function _getAssetPrice(
        address _asset
    ) internal view virtual returns (uint256) {
        PriceConfig storage _priceConfig = priceConfigs_[_asset];

        if (_priceConfig.decimals == 0) return 0;

        (, int256 _answer, , , ) = exOracle.latestRoundData(
            _priceConfig.key,
            dataSource
        );
        if (_answer < 0) return 0;

        return
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                uint256(_priceConfig.decimals),
                uint256(_answer)
            );
    }

    /**
     * @dev Get asset price.
     * @param _asset Asset address.
     * @return Asset price.
     */
    function getAssetPrice(
        address _asset
    ) external virtual override returns (uint256) {
        return _getAssetPrice(_asset);
    }

    /**
     * @dev Get asset price status.
     * @param _asset Asset address.
     * @return Asset price status, true: available; false: unavailable.
     */
    function getAssetStatus(
        address _asset
    ) external virtual override returns (bool) {
        PriceConfig storage _priceConfig = priceConfigs_[_asset];
        if (_priceConfig.decimals == 0) return false;

        (, , , uint256 _updatedAt, ) = exOracle.latestRoundData(
            _priceConfig.key,
            dataSource
        );

        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        return block.timestamp < _updatedAt.add(_assetValidInterval);
    }

    /**
     * @dev The price and status of the asset.
     * @param _asset Asset address.
     * @return Asset price and status.
     */
    function getAssetPriceStatus(
        address _asset
    ) external virtual override returns (uint256, bool) {
        PriceConfig storage _priceConfig = priceConfigs_[_asset];
        if (_priceConfig.decimals == 0) return (0, false);

        (, int256 _answer, , uint256 _updatedAt, ) = exOracle.latestRoundData(
            _priceConfig.key,
            dataSource
        );

        if (_answer < 0) return (0, false);
        uint256 _assetValidInterval = heartbeat_[_asset];
        if (_assetValidInterval == 0) _assetValidInterval = defaultHeartbeat_;

        return (
            _correctPrice(
                uint256(IERC20(_asset).decimals()),
                uint256(_priceConfig.decimals),
                uint256(_answer)
            ),
            block.timestamp < _updatedAt.add(_assetValidInterval)
        );
    }

    /**
     * @notice Asset .
     * @dev Get pyth feed ID.
     * @param _asset Asset address.
     * @return pyth feed ID.
     */
    function priceConfig(
        address _asset
    ) external view returns (PriceConfig memory) {
        return priceConfigs_[_asset];
    }
}
