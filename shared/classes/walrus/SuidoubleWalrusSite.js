import { SuiObject } from 'suidouble';
import SuidoubleWalrusResource from './SuidoubleWalrusResource.js';
import SuidoubleWalrusSiteFolder from './SuidoubleWalrusSiteFolder.js';
import AbstractCommon from './AbstractCommon.js';
import SuidoubleWalrusFetchCached from './SuidoubleWalrusCache.js';

import SuidoubleWalrusAES from './SuidoubleWalrusAES.js';

import suidouble from 'suidouble';
const Transaction = suidouble.Transaction;
const txInput = suidouble.txInput;

export default class SuidoubleWalrusSite extends AbstractCommon {
    constructor(params = {}) {
        super(params);

        this._suidoubleWalrusSites = params.suidoubleWalrusSites;
        this._id = params.id;

        if (params.suiObject) {
            this._suiObject = params.suiObject;
            this._id = this._suiObject.id;
        } else {
            this._suiObject = new SuiObject({
                id: this._id,
                suiMaster: this.suiMaster,
            });
        }

        this._resources = {};
        this._root = new SuidoubleWalrusSiteFolder({
            suidoubleWalrusSite: this,
            parent: null,
            name: '',
        });
        this._root.addEventListener('folder', (e)=>{
            // e.detail - instance of SuidoubleWalrusSiteFolder
            this.emit('folder', e.detail);
        });

        this._cached = new SuidoubleWalrusFetchCached({});

        this._folders = {};
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

    async isOwnedBy(address) {
        await this.initialize();
        return this._suiObject.isOwnedBy(address);
    }

    getFolder(path) {
        return this._root.getFolder(path);
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._suiObject?.fields?.name;
    }

    get cached() {
        return this._cached;
    }

    get config() {
        return this._suidoubleWalrusSites.config;
    }

    get sitesPackageId() {
        return this._suidoubleWalrusSites.sitesPackageId;
    }

    get resources() {
        return this._resources;
    }

    get root() {
        return this._root;
    }

    get folders() {
        return this._folders;
    }

    get suiMaster() {
        return this._suidoubleWalrusSites.suiMaster;
    }

    get basePublisherUrl() {
        return this._suidoubleWalrusSites.basePublisherUrl;
    }

    get movePackage() {
        return this._suidoubleWalrusSites.movePackage;
    }

    async upload(inputFile, path, encrypt = false) {
        let data = inputFile;
        const contentType = inputFile.type;

        console.log(this.suiMaster.signer);
        console.log(this.suiMaster.address);
        // await this.suiMaster.signer.activeAdapter.signMessage({
        //     message: (new TextEncoder().encode('Hello world')),
        //     accountAddress: this.suiMaster.address,
        // });

        if (encrypt) {
            const message = await SuidoubleWalrusAES.hashKeyMessage(inputFile);
            const m = await this.suiMaster.signer.activeAdapter.signMessage({
                message: message,
                account: { address: this.suiMaster.address},
            });
            // signature is actually a base64 encoded, we can convert it, but lets better use it as a string to apply PBKDF2 over
            const password = m.signature;
            data = await SuidoubleWalrusAES.encrypt(inputFile, password);
            path = path + '.encrypted';

        }

        const uploadedResponse = await fetch(`${this.basePublisherUrl}/v1/store?epochs=5`, {
            method: "PUT",
            body: data,
        });
        const uploaded = await uploadedResponse.json();

        let blobId = null;
        if (uploaded && uploaded.newlyCreated && uploaded.newlyCreated.blobObject && uploaded.newlyCreated.blobObject.blobId) {
            blobId = uploaded.newlyCreated.blobObject.blobId;
        } else if (uploaded && uploaded.alreadyCertified && uploaded.alreadyCertified.blobId)
        blobId = uploaded.alreadyCertified.blobId;
        // console.log(uploaded);

        if (!blobId) {
            throw new Error('can not upload blob');
        }

        const tx = new Transaction();
        // console.log(txInput(tx, 'string', 'name'));

        console.log(blobId);
        const blobIdAsBigInt = this.base64UrlSafeDecode(blobId);
        console.log(blobIdAsBigInt);
        // console.log(''+blobIdAsBigInt);
        // const blobIdAsBigInt = '0x'+this.bigintToHex(this.base64UrlSafeDecode(blobId));
        // console.log(blobId);
        // AFsa8A7Yp4JzjLsHRxi9VbWIhRZ1MKbfyQ5JCZLh7n0
        // 0x005b1af00ed8a782738cbb074718bd55b58885167530a6dfc90e490992e1ee7d
        // 160969000250548151769137794813977051256368899010644876699293674886702165629
        // return;
        console.log(blobIdAsBigInt);
        const args = [txInput(tx,  'string', path), txInput(tx,  'string', contentType), txInput(tx,  'string', 'plaintext'), txInput(tx,  'u256', blobIdAsBigInt)];
        const move_resource = tx.moveCall({
            target: `${this.sitesPackageId}::site::new_resource`,
            arguments: args,
            typeArguments: [],
        });
        const args2 = [tx.object(''+this.id), move_resource];
        tx.moveCall({
            target: `${this.sitesPackageId}::site::add_resource`,
            arguments: args2,
            typeArguments: [],
        });
        const resp = await this.movePackage.moveCall('site', 'new_resource', {tx: tx});

        console.log('resp', resp);

        if (encrypt) {
            let resourceId = null;
            if (resp && resp.created && resp.created[0]) {
                resourceId = resp.created[0].id;
                const tempResource = new SuidoubleWalrusResource({
                    suidoubleWalrusSite: this,
                    path: path,
                    id: resourceId,
                });
                this._resources[path] = tempResource;
                this._root.pushResource(tempResource);
                this.emit('resource', tempResource);

            }
        } else {
            const tempResource = new SuidoubleWalrusResource({
                suidoubleWalrusSite: this,
                path: path,
                inputFile: inputFile,
            });
            this._resources[path] = tempResource;
            this._root.pushResource(tempResource);
            this.emit('resource', tempResource);

        }


        return true;

        // // this.cached.putToCache(path, inputFile);

        // for (const created of resp.created) {
        //     console.log(created.typeName);
        //     console.log(created.fields);
        // }

        // console.log(resp);
        // console.log(resp.created);
        // console.log(resp.created[0]);
        // console.log(resp.created[0].typeName);

        // const resouceId = resp.created[0].id;
        // const resource = new SuidoubleWalrusResource({
        //     suidoubleWalrusSite: this,
        //     id: resouceId,
        //     path: path,
        // });
        // this._resources[path] = resource;
        // this._root.pushResource(resource);
        // this.emit('resource', resource);
    }

    async getResources() {
        const paginated = await this._suiObject.getDynamicFields();
        await paginated.forEach((field)=>{
            // console.log(field);
            const path = field.name.value.path;
            const id = field.objectId;
            console.log(field);

            if (this._resources[path]) {
                return true;
            }

            const resource = new SuidoubleWalrusResource({
                suidoubleWalrusSite: this,
                id: id,
                path: path,
            });
            this._resources[path] = resource;
            this._root.pushResource(resource);
            this.emit('resource', resource);
        });

        console.log('getResources finished', this._root);

        return this.resources;
    }
};


