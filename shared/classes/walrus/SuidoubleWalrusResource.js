import { SuiObject } from 'suidouble';
import { bcs } from "@mysten/bcs";
import AbstractCommon from './AbstractCommon.js';
import ThumbGenerator from '../ThumbGenerator.js';

const AGGREGATOR = "https://aggregator-devnet.walrus.space:443";
import SuidoubleWalrusAES from './SuidoubleWalrusAES.js';

export default class SuidoubleWalrusResource extends AbstractCommon {
    constructor(params = {}) {
        super(params);

        this._suidoubleWalrusSite = params.suidoubleWalrusSite;
        this._id = params.id;
        this._path = (''+params.path);
        this._inputFile = params.inputFile;

        if (this._id) {
            this._suiObject = new SuiObject({
                id: this._id,
                suiMaster: this.suiMaster,
            });
            this._isFinalized = true;
        } else {
            this._suiObject = null;
            this._isFinalized = false;
        }

        this._isInitialized = false;

    }

    get isFile() {
        return true;
    }

    get isFolder() {
        return false;
    }

    get id() {
        return this._id;
    }

    get path() {
        return this._path;
    }

    get name() {
        return (''+this.path).split('/').pop();
    }

    get suiMaster() {
        return this._suidoubleWalrusSite.suiMaster;
    }

    getPathRelativeTo(root = '') {
        if (this._path.startsWith(root)) {
            return this._path.slice(root.length);
        }
        return this._path;
    }

    getFolderRelativeTo(root = '') {
        const path = this.getPathRelativeTo(root);
        const splet = path.split('/');
        if (splet.length > 2) {
            return splet[1];
        }
        return null;
    }

    async initialize() {
        if (!this._suiObject) {
            return false;
        }
        if (await this.threadIsThere('initialize')) {
            return true;
        }
        await this._suiObject.fetchFields();
        this.resolveSingleThread('initialize');
        return true;
    }

    async isEncrypted() {
        await this.initialize();
        if (this.path.endsWith('.encrypted') ) {
            return true;
        }

        return false;
    }

    async isImage() {
        try {
            const contentType = await this.getContentType();
            const imageMimeTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/bmp",
                "image/tiff",
                // "image/svg+xml",
                "image/x-icon",
                "image/heif",
                "image/heic",
                "image/avif"
              ];
            if (imageMimeTypes.indexOf(contentType) !== -1) {
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    async isVideo() {
        try {
            const contentType = await this.getContentType();
            const mimeTypes = [
                "video/mp4",
                "video/quicktime",
              ];
            if (mimeTypes.indexOf(contentType) !== -1) {
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    async getFields() {
        await this.initialize();
        return this._suiObject.fields;
    }

    async getContentType() {
        if (this._inputFile) {
            return this._inputFile.type;
        }
        await this.initialize();
        return this._suiObject?.fields?.value?.fields?.content_type;
    }

    async getContentEncoding() {
        await this.initialize();
        return this._suiObject.fields?.value?.fields?.content_encoding;
    }

    async getBlobId() {
        await this.initialize();
        return this._suiObject.fields?.value?.fields?.blob_id;
    }

    // // https://github.com/MystenLabs/walrus-sites/blob/main/portal/common/lib/bcs_data_parsing.ts
    // base64UrlSafeEncode(data) {
    //     let base64 = this.arrayBufferToBase64(data);
    //     // Use the URL-safe Base 64 encoding by removing padding and swapping characters.
    //     return base64.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
    // }
    
    // arrayBufferToBase64(bytes) {
    //     // Convert each byte in the array to the correct character
    //     const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    //     // Encode the binary string to base64 using btoa
    //     return btoa(binaryString);
    // }

    idTo64(id) {
        // return this.base64UrlSafeEncode(bcs.u256().serialize(id).toBytes());
        // return this.base64UrlSafeEncode(bcs.u256().serialize(id).toBytes());
        const asA = this.bigintToUint8Array2(BigInt(id), 32);
        console.log(asA);
        console.log(String.fromCharCode.apply(null, asA));
        // let base64String = btoa(String.fromCharCode.apply(null, asA));
        // console.log(base64String);
        // asA.reverse();
        let base64String = btoa(String.fromCharCode.apply(null, asA));
        console.log(btoa(String.fromCharCode.apply(null, asA)));

        return base64String.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
    }

    async getVideoPlayURL() {
        const isEncrypted = await this.isEncrypted();

        if (this._inputFile) {
            return URL.createObjectURL(this._inputFile);
        } else if (!isEncrypted) {
            return await this.getAggregatorURL();
        } else if (isEncrypted) {
            return await this.getBytesBlobURL();
        }
    }

    async getAggregatorURL() {
        const blobId = await this.getBlobId();
        if (!blobId) {
            return null;
        }
        console.error('blobId', blobId);
        console.error('id', this._id);
        const url = new URL(AGGREGATOR + "/v1/" + encodeURIComponent(this.idTo64(blobId)));
        console.error('url', ''+url);
        console.error('url', ''+this.path);
        return url;
    }

    async bytes() {
        const isEncrypted = await this.isEncrypted();
        
        if (this._inputFile) {
            return this._inputFile;
        }

        const url = await this.getAggregatorURL();
        const contentEncoding = await this.getContentEncoding();

        let body = null;
        let bytes = null;

        if (isEncrypted) {
            const contents = await fetch(url);
            body = await contents.arrayBuffer();
            // console.error(body);
            // console.error(body.length);
            // console.error(Uint8Array.from(body));
            body = new Uint8Array(body);

            const message = await SuidoubleWalrusAES.hashKeyMessage( body );

            const m = await this.suiMaster.signer.activeAdapter.signMessage({
                message: message,
                account: { address: this.suiMaster.address},
            });
            const password = m.signature;
            const decrypted = await SuidoubleWalrusAES.decrypt(body, password);
            bytes = decrypted;

        } else {
            // const contents = await fetch(url);
            // Deserialize the bcs encoded body and decompress.
            const contents = await this._suidoubleWalrusSite.cached.fetch(url);
            body = await contents.arrayBuffer();
            bytes = body;
        }


        try {
            if (contentEncoding == 'gzip') {
                bytes = ungzip(bytes);
            } else if (contentEncoding == 'deflate') {
                bytes = inflate(bytes);
            } else if (contentEncoding == 'deflate-raw') {
                bytes = inflateRaw(bytes);
            }
        } catch (e) {
            console.error(e);
            bytes = body;
        }

        return bytes;
    }

    async getBytesBlobURL() {
        const bytes = await this.bytes();
        const blob = new Blob([bytes]);
        return URL.createObjectURL(blob);
    }

    async getRatio() {
        if (this._inputFile) {
            return 1;
        }

        const isImage = await this.isImage();

        if (!isImage) {
            return 1;
        }
        
        const isEncrypted = await this.isEncrypted();
        if (isEncrypted) {
            return 1;
        }

        const url = await this.getAggregatorURL();
        if (!url) {
            return 1;
        }

        try {
            const ratio = await this._suidoubleWalrusSite.cached.fetchRatio(url);
            return ratio;
        } catch (e) {
            console.error(e);
        }

        return 1;
    }

    async getThumbBlobURL() {
        const isVideo = await this.isVideo();

        if (this._inputFile && !isVideo) {
            return URL.createObjectURL(this._inputFile);
        }

        const thumb = await this.getThumbBlob();
        const thumbUrl = URL.createObjectURL(thumb);

        return thumbUrl;
    }

    async getThumbBlob() {
        const isImage = await this.isImage();
        const isVideo = await this.isVideo();

        if (this._inputFile && isVideo) {
            const thumbGenerator = new ThumbGenerator();
            const thumbResult = await thumbGenerator.getVideoBlob(URL.createObjectURL(this._inputFile));
            if (thumbResult && thumbResult.blob) {
                return thumbResult.blob;
            }

            return null;
        }

        const blobId = await this.getBlobId();
        const url = new URL(AGGREGATOR + "/v1/" + encodeURIComponent(this.idTo64(blobId)));
        
        if (isImage) {
            const contents = await this._suidoubleWalrusSite.cached.fetchThumb(url);
            const blob = await contents.blob();
            return blob;
        } else if (isVideo) {
            const contents = await this._suidoubleWalrusSite.cached.fetchVideoThumb(url);
            const blob = await contents.blob();
            return blob;
        }

        return null;
    }

    async download() {
        const isEncrypted = await this.isEncrypted();

        const blobUrl = await this.getBytesBlobURL();
        let link = document.createElement("a");
        link.href = blobUrl;

        link.download = (''+this.name).split('.encrypted').join('');

        document.body.appendChild(link);
        link.innerHTML = "download";
        link.style.display = 'none';
        link.click();

        link.remove();
    }
};


