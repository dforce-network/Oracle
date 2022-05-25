//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;


import "@openzeppelin/contracts/utils/Address.sol";

import "./library/Initializable.sol";
import "./library/Ownable.sol";
// import "./library/ReentrancyGuard.sol";
// import "./library/SafeRatioMath.sol";

import "./interface/IPriceModel.sol";

contract Oracle is
    Initializable,
    Ownable
{
    using Address for address;
    /// @dev Flag for whether or not contract is paused_.
    bool internal paused_;

    /// @dev Address of the price poster_.
    address internal poster_;

    /// @dev Mapping of asset addresses and their corresponding price in terms of Eth-Wei
    ///     which is simply equal to AssetWeiPrice * 10e18. For instance, if OMG token was
    ///     worth 5x Eth then the price for OMG would be 5*10e18 or 5000000000000000000.
    ///     map: assetAddress -> uint256
    mapping(address => uint256) internal assetPrices_;

    /// @dev Mapping of asset addresses to priceModel_.
    mapping(address => IPriceModel) internal priceModel_;

    /**
     * @dev Emitted for priceModel_ changes.
     */
    event SetAssetPriceModel(address asset, IPriceModel priceModel);

    /**
     * @dev Emitted for all price changes.
     */
    event PricePosted(
        address asset,
        uint256 previousPriceMantissa,
        uint256 requestedPriceMantissa,
        uint256 newPriceMantissa
    );

    /**
     * @dev Emitted if this contract successfully posts a capped-to-max price.
     */
    event CappedPricePosted(
        address asset,
        uint256 requestedPriceMantissa,
        uint256 anchorPriceMantissa,
        uint256 cappedPriceMantissa
    );

    /**
     * @dev Emitted when admin either pauses or resumes the contract; `newState` is the resulting state.
     */
    event SetPaused(bool newState);

    /**
     * @dev Emitted when `poster_` is changed.
     */
    event NewPoster(address oldPoster, address newPoster);

    constructor(address _poster) public {
        initialize(_poster);
    }

    /**
     * @dev Initialize contract to set some configs.
     * @param _poster Staked DF token address.
     */
    function initialize(address _poster) public initializer {
        __Ownable_init();
        // __ReentrancyGuard_init();
        _setPoster(_poster);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyPoster() {
        require(poster_ == msg.sender, "onlyPoster: caller is not the poster_");
        _;
    }

    /**
     * @notice Do not pay into PriceOracle.
     */
    receive() external payable {
        revert();
    }

    /**
     * @notice Set `paused_` to the specified state.
     * @dev Owner function to pause or resume the contract.
     * @param _requestedState Value to assign to `paused_`.
     */
    function _setPaused(bool _requestedState) external onlyOwner {
        paused_ = _requestedState;
        emit SetPaused(_requestedState);
    }

    /**
     * @notice Set new poster_.
     * @dev Owner function to change of poster_.
     * @param _newPoster New poster_.
     */
    function _setPoster(address _newPoster) public onlyOwner {
        // Save current value, if any, for inclusion in log.
        address _oldPoster = poster_;
        require(_oldPoster != _newPoster,"_setPoster: poster_ address invalid!");
        // Store poster_ = newPoster.
        poster_ = _newPoster;

        emit NewPoster(_oldPoster, _newPoster);
    }

    /**
     * @notice Set `priceModel_` for asset to the specified address.
     * @dev Function to change of priceModel_.
     * @param _asset Asset for which to set the `priceModel_`.
     * @param _priceModel Address to assign to `priceModel_`.
     */
    function _setAssetPriceModelInternal(address _asset, IPriceModel _priceModel) internal {

        require(
            _priceModel.isPriceModel(),
            "_setAssetPriceModelInternal: This is not the priceModel_ contract!"
        );
        
        priceModel_[_asset] = _priceModel;
        emit SetAssetPriceModel(_asset, _priceModel);
    }

    function _setAssetPriceModel(address _asset, IPriceModel _priceModel)
        external
        onlyOwner
    {
        _setAssetPriceModelInternal(_asset, _priceModel);
    }

    function _setAssetPriceModelBatch(
        address[] calldata _assets,
        IPriceModel[] calldata _priceModels
    ) external onlyOwner {
        require(
            _assets.length == _priceModels.length,
            "_setAssetStatusOracleBatch: assets & priceModels must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setAssetPriceModelInternal(_assets[i], _priceModels[i]);
    }

    /**
     * @notice Set the `priceModel_` to disabled.
     * @dev Function to disable of priceModel_.
     */
    function _disableAssetPriceModelInternal(address _asset) internal {
        
        priceModel_[_asset] = IPriceModel(0);
        
        emit SetAssetPriceModel(_asset, IPriceModel(0));
    }

    function _disableAssetPriceModel(address _asset)
        external
        onlyOwner
    {
        _disableAssetPriceModelInternal(_asset);
    }

    function _disableAssetStatusOracleBatch(address[] calldata _assets) external onlyOwner {
        for (uint256 i = 0; i < _assets.length; i++)
            _disableAssetPriceModelInternal(_assets[i]);
    }


    function _execute(address _target, string memory _signature, bytes memory _data) internal returns (bytes memory) {

        require(bytes(_signature).length > 0, "_execute: Parameter signature can not be empty!");
        bytes memory _callData = abi.encodePacked(bytes4(keccak256(bytes(_signature))), _data);
        return _target.functionCall(_callData);
    }

    function _executeTransaction(address _target, string memory _signature, bytes memory _data)
        external
        onlyOwner
    {
        _execute(_target, _signature, _data);
    }

    function _executeTransactions(address[] memory _targets, string[] memory _signatures, bytes[] memory _calldatas)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _targets.length; i++) {
            _execute(_targets[i], _signatures[i], _calldatas[i]);
        }
    }

    function _setAsset(address _asset, string memory _signature, bytes memory _data)
        external
        onlyOwner
    {
        _execute(address(priceModel_[_asset]), _signature, _data);
    }

    function _setAssets(address[] memory _assets, string[] memory _signatures, bytes[] memory _calldatas)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _assets.length; i++) {
            _execute(address(priceModel_[_assets[i]]), _signatures[i], _calldatas[i]);
        }
    }

    function setPriceInternal(address _asset, uint256 _requestedPrice)
        internal
        returns (uint256)
    {
        return priceModel_[_asset]._setPrice(_asset, _requestedPrice);
    }

    /**
     * @notice Entry point for updating prices.
     *         1) If admin has set a `readerPrice` for this asset, then poster_ can not use this function.
     *         2) Standard stablecoin has 18 deicmals, and its price should be 1e18,
     *            so when the poster_ set a new price for a token,
     *            `requestedPriceMantissa` = actualPrice * 10 ** (18-tokenDecimals),
     *            actualPrice is scaled by 10**18.
     * @dev Set price for an asset.
     * @param _asset Asset for which to set the price.
     * @param _requestedPrice Requested new price, scaled by 10**18.
     * @return Uint 0=success, otherwise a failure (see enum OracleError for details).
     */
    function setPrice(address _asset, uint256 _requestedPrice)
        external
        onlyPoster
        returns (uint256)
    {
        return setPriceInternal(_asset, _requestedPrice);
    }

    /**
     * @notice Entry point for updating multiple prices.
     * @dev Set prices for a variable number of assets.
     * @param _assets A list of up to assets for which to set a price.
     *        Notice: 0 < _assets.length == _requestedPrices.length
     * @param _requestedPrices Requested new prices for the assets, scaled by 10**18.
     *        Notice: 0 < _assets.length == _requestedPrices.length
     * @return Uint values in same order as inputs.
     *         For each: 0=success, otherwise a failure (see enum OracleError for details)
     */
    function setPrices(
        address[] memory _assets,
        uint256[] memory _requestedPrices
    ) external onlyPoster returns (uint256[] memory) {

        uint256 numAssets = _assets.length;
        uint256 numPrices = _requestedPrices.length;
        require(numAssets > 0 && numAssets == numPrices,"setPrices: _assets & _requestedPrices must match the current length.");

        uint256[] memory result = new uint256[](numAssets);
        for (uint256 i = 0; i < numAssets; i++) {
            result[i] = setPriceInternal(_assets[i], _requestedPrices[i]);
        }

        return result;
    }

    /**
     * @notice Asset prices are provided by chain link or other aggregator.
     * @dev Get price of `asset` from aggregator.
     * @param _asset Asset for which to get the price.
     * @return Uint mantissa of asset price (scaled by 1e18) or zero if unset or under unexpected case.
     */
    function getAssetAggregatorPrice(address _asset) external returns (uint256) {
        return priceModel_[_asset].getAssetPrice(_asset);
    }

    function getAssetPrice(address _asset) external returns (uint256) {
        return priceModel_[_asset].getAssetPrice(_asset);
    }

    /**
     * @notice This is a basic function to read price, although this is a public function,
     *         It is not recommended, the recommended function is `assetPrices(asset)`.
     *         If `asset` does not has a reader to reader price, then read price from original
     *         structure `assetPrices_`;
     *         If `asset` has a reader to read price, first gets the price of reader, then
     *         `readerPrice * 10 ** |(18-assetDecimals)|`
     * @dev Get price of `asset`.
     * @param _asset Asset for which to get the price.
     * @return Uint mantissa of asset price (scaled by 1e18) or zero if unset.
     */
    function getReaderPrice(address _asset) external returns (uint256) {
        return priceModel_[_asset].getAssetPrice(_asset);
    }

    /**
     * @notice Retrieves price of an asset.
     * @dev Get price for an asset.
     * @param _asset Asset for which to get the price.
     * @return Uint mantissa of asset price (scaled by 1e18) or zero if unset or contract paused_.
     */
    function getUnderlyingPrice(address _asset) external returns (uint256) {
        if (paused_)
            return 0;
        return priceModel_[_asset].getAssetPrice(_asset);
    }

    /**
     * @notice The asset price status is provided by priceModel_.
     * @dev Get price status of `asset` from priceModel_.
     * @param _asset Asset for which to get the price status.
     * @return The asset price status is Boolean, the price status model is not set to true.true: available, false: unavailable.
     */
    function getAssetPriceStatus(address _asset) external returns (bool) {
        return priceModel_[_asset].getAssetStatus(_asset);
    }

    /**
     * @notice Retrieve asset price and status.
     * @dev Get the price and status of the asset.
     * @param _asset The asset whose price and status are to be obtained.
     * @return Asset price and status.
     */
    function getUnderlyingPriceAndStatus(address _asset) external returns (uint256, bool) {
        if (paused_)
            return (0, false);
        return priceModel_[_asset].getAssetPriceStatus(_asset);
    }

    function paused() external view returns (bool) {
        return paused_;
    }

    function poster() external view returns (address) {
        return poster_;
    }

    function assetPrices(address _asset) external view returns (uint256) {
        return assetPrices_[_asset];
    }

    function priceModel(address _asset) external view returns (IPriceModel) {
        return priceModel_[_asset];
    }
}
