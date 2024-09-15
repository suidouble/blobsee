import { SuiMaster } from 'suidouble';
import SuidoubleWalrusBlob from './SuidoubleWalrusBlob.js';
import SuidoubleWalrusSites from './SuidoubleWalrusSites.js';

export default class SuidoubleWalrus {
    constructor(params = {}) {
        // this._packageId = params.packageId || '0x7e12d67a52106ddd5f26c6ff4fe740ba5dea7cfc138d5b1d33863ba9098aa6fe';
        this._isInitialized = false;
        this._suiMaster = params.suiMaster || null;
        this._movePackage = null;
        this._config = params.config || {};

        this._sites = new SuidoubleWalrusSites({
            suidoubleWalrus: this,
        });
    }

    get sites() {
        return this._sites;
    }

    get config() {
        return this._config;
    }

    // async initialize() {
    //     if (this._isInitialized) {
    //         return true;
    //     }
    //     // @todo: sure single run async

    //     this._movePackage = this._suiMaster.addPackage({
    //         id: '0x7e12d67a52106ddd5f26c6ff4fe740ba5dea7cfc138d5b1d33863ba9098aa6fe',
    //     });
    //     await this._movePackage.isOnChain();

    //     this._isInitialized = true;

    //     return true;
    // }

    // async getBlobEvents() {
    //     await this.initialize();

    //     const paginated = await this._movePackage.modules.blob_events.fetchEvents({
    //         eventTypeName: 'BlobCertified',
    //     });

    //     const objects = [];
    //     await paginated.forEach((suiEvent)=>{
    //         console.log(suiEvent.parsedJson);
    //         suiEvent.parsedJson.blob_id = '69021375488454390241881096001453177519774171917153806178988984930159203929097';
    //         const id = '0x'+BigInt( suiEvent.parsedJson.blob_id ).toString(16);
    //         console.log(id);
            
    //         const blob = new SuidoubleWalrusBlob({
    //                 suidoubleWalrus: this,
    //                 id: id,
    //             });
    //         objects.push(blob);
    //     }, 50);

    //     const so = await objects[10].get();


    // }

    // bigIntToStringId(v) {
    //     const b = BigInt(v);
    //     const asStr = b.toString(16);
    //     while (asStr < 64) { // 32 bytes, 64 hex chars
    //         asStr = '0' + asStr;
    //     }
    //     return '0x'+asStr;
    // }


    // bigIntTo32Bytes(v) {
    //     let hex = BigInt(v).toString(16);
    //     if (hex.length % 2) { hex = '0' + hex; }

    //     while (hex.length < 64) { // 32 bytes, 64 hex chars
    //         hex = '0' + hex;
    //     }

    //     const len = hex.length / 2;
    //     const u8 = new Uint8Array(len);
        
    //     let i = 0;
    //     let j = 0;
    //     while (i < len) {
    //         u8[i] = parseInt(hex.slice(j, j+2), 16);
    //         i += 1;
    //         j += 2;
    //     }

    //     return u8;
    // }
};