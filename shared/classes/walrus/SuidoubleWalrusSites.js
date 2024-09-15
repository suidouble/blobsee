import SuidoubleWalrusSite from "./SuidoubleWalrusSite.js";
import suidouble, { SuiObject } from 'suidouble';
const Transaction = suidouble.Transaction;
const txInput = suidouble.txInput;

export default class SuidoubleWalrusSites {
    constructor(params = {}) {
        this._suidoubleWalrus = params.suidoubleWalrus;
        this._movePackage = null;
        this._isInitialized = false;
    }

    get suiMaster() {
        return this._suidoubleWalrus._suiMaster;
    }

    get config() {
        return this._suidoubleWalrus.config;
    }

    get sitesPackageId() {
        return this.config.sitesPackageId || '0x514cf7ce2df33b9e2ca69e75bc9645ef38aca67b6f2852992a34e35e9f907f58';
    }

    get basePublisherUrl() {
        return 'https://publisher-devnet.walrus.space';
    }

    get movePackage() {
        return this._movePackage;
    }

    async initialize() {
        if (this._isInitialized) {
            return true;
        }
        // @todo: sure single run async

        this._movePackage = this.suiMaster.addPackage({
            id: this.sitesPackageId,
        });
        await this._movePackage.isOnChain();

        this._isInitialized = true;

        return true;
    }

    async getOwned() {
        await this.initialize();

        const ret = [];
        const paginatedResponse = await this._movePackage.modules.site.getOwnedObjects({
                typeName: 'Site',
            });
        await paginatedResponse.forEach((suiObject)=>{
            const site = new SuidoubleWalrusSite({
                    suiObject,
                    suidoubleWalrusSites: this,
                });
            ret.push(site);
        });

        return ret;
    }

    async create(name) {
        await this.initialize();

        const tx = new Transaction();
        // console.log(txInput(tx, 'string', 'name'));
        const args = [txInput(tx,  'string', name)];
        const move_site = tx.moveCall({
            target: `${this.sitesPackageId}::site::new_site`,
            arguments: args,
            typeArguments: [],
        });
        tx.transferObjects([move_site], this.suiMaster.address);
        const resp = await this._movePackage.moveCall('site', 'new_site', {tx: tx});
        console.error(resp);

        // if (resp && resp.digest) {
        //     await this._movePackage.
        // }

        if (resp && resp.created && resp.created.length) {
            const site = new SuidoubleWalrusSite({
                    id: resp.created[0].id,
                    suidoubleWalrusSites: this,
                });
            return site;
        }

        return null;
    }

    async get(siteId) {
        await this.initialize();

        const site = new SuidoubleWalrusSite({
                id: siteId,
                suidoubleWalrusSites: this,
            });
        return site;

        // const obj = await this.suiMaster.client.getObject({
        //     id: this._id,
        //     options: { showBcs: true },
        // });

        // console.log(obj);

        // const SuiObject = this.suiMaster.SuiObject;
        // const suiObject = new SuiObject({
        //         id: this._id,
        //         suiMaster: this.suiMaster,
        //     });
        // await suiObject.fetchFields();

        // return suiObject;
    }

};


