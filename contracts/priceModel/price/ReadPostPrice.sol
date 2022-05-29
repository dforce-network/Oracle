// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "./PostPrice.sol";

contract ReadPostPrice is PostPrice {

    /**
     * @dev Mapping of asset addresses to asset addresses. Stable coin can share a price.
     *
     * map: assetAddress -> Reader
     */
    struct Reader {
        address asset; // Asset to read price
        int256 decimalsDifference; // Standard decimal is 18, so this is equal to the decimal of `asset` - 18.
    }
    mapping(address => Reader) internal readers_;

    /**
     * @dev Emitted for all readers changes.
     */
    event ReaderPosted(
        address asset,
        address oldReader,
        address newReader,
        int256 decimalsDifference
    );


    /**
     * @notice Entry point for updating prices.
     * @dev Set reader for an asset.
     * @param _asset Asset for which to set the reader.
     * @param _readAsset Reader address, if the reader is address(0), cancel the reader.
     */
    function _setReaderInternal(address _asset, address _readAsset)
        internal
    {
        address _oldReadAsset = readers_[_asset].asset;
        // require(_readAsset != _oldReadAsset, "setReaders: Old and new values cannot be the same.");
        require(
            _readAsset != _asset,
            "_setReaderInternal: asset and readAsset cannot be the same."
        );

        readers_[_asset].asset = _readAsset;
        if (_readAsset == address(0)) readers_[_asset].decimalsDifference = 0;
        else
            readers_[_asset].decimalsDifference = int256(
                IERC20(_asset).decimals() - IERC20(_readAsset).decimals()
            );

        emit ReaderPosted(
            _asset,
            _oldReadAsset,
            _readAsset,
            readers_[_asset].decimalsDifference
        );
    }

    function _setReader(address _asset, address _readAsset)
        external
        virtual
        onlyOwner
    {
        _setReaderInternal(_asset, _readAsset);
    }

    function _setReaderBatch(
        address[] calldata _assets,
        address[] calldata _readAssets
    ) external virtual onlyOwner {
        require(
            _assets.length == _readAssets.length,
            "_setReaderBatch: assets & readAssets must match the current length."
        );
        for (uint256 i = 0; i < _assets.length; i++)
            _setReaderInternal(_assets[i], _readAssets[i]);
    }

    function _setPrice(address _asset, uint256 _requestedPrice) external override virtual onlyOwner returns (uint256) {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset != address(0))
            return assetPrices_[_reader.asset];
        return _setPriceInternal(_asset, _requestedPrice);
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
    function _getAssetPrice(address _asset) internal override virtual view returns (uint256) {
        Reader storage _reader = readers_[_asset];
        if (_reader.asset == address(0)) return assetPrices_[_asset];

        uint256 readerPrice = assetPrices_[_reader.asset];

        if (_reader.decimalsDifference < 0)
            return readerPrice.mul(10 ** (uint256(0 - _reader.decimalsDifference)));

        return readerPrice.div(10 ** (uint256(_reader.decimalsDifference)));
    }
}