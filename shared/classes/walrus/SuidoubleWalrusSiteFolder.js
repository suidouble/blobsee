
import AbstractCommon from './AbstractCommon.js';

export default class SuidoubleWalrusSiteFolder extends AbstractCommon {
    constructor(params = {}) {
        super(params);

        this._suidoubleWalrusSite = params.suidoubleWalrusSite;
        this._parent = params.parent;
        this._name = params.name;

        this._resources = {};
        this._folders = {};
    }

    get isFile() {
        return false;
    }

    get isFolder() {
        return true;
    }

    get id() { // helper for vue loops
        return this.fullPath; 
    }

    get parent() {
        return this._parent;
    }

    get config() {
        return this._suidoubleWalrusSite.config;
    }

    get resources() {
        return this._resources;
    }

    get folders() {
        return this._folders;
    }

    get suiMaster() {
        return this._suidoubleWalrusSite.suiMaster;
    }

    get name() {
        return this._name;
    }

    get fullPath() {
        if (this._parent) {
            return this._parent.fullPath + '/' + this._name;
        } else if (this._name) {
            return '/' + this._name;
        } else {
            return ''; // root
        }
    }

    getFolder(path) {
        if (path == this.fullPath) {
            return this;
        }
        for (const key in this._folders) {
            const found = this._folders[key].getFolder(path);
            if (found) {
                return found;
            }
        }
        return null;
    }

    pushResource(resource) {
        const folderName = resource.getFolderRelativeTo(this.fullPath);
        console.log('pushing resource to folder', this, resource, 'foldername: '+folderName);
        if (folderName !== null) {
            // resource belongs to subfolder
            if (!this._folders[folderName]) {
                const folder = new SuidoubleWalrusSiteFolder({
                    suidoubleWalrusSite: this._suidoubleWalrusSite,
                    parent: this,
                    name: folderName,
                });
                this._folders[folderName] = folder;
                this.emit('folder', folder);
                // folder.addEventListener('folder', (e)=>{
                //     // e.detail - instance of SuidoubleWalrusSiteFolder
                //     this.emit('folder', e.detail);
                // });
            }
            this._folders[folderName].pushResource(resource);
        } else {
            // resources belongs directly to this folder
            this._resources[resource.path] = resource;
            this.emit('resource', resource);
            console.log(this.config);
        }
    }

    async upload(inputFile, encrypted = false) {
        let path = this.fullPath + '/' + inputFile.name;
        if (path[0] !== '/') {
            path = '/'+path;
        }
        
        await this._suidoubleWalrusSite.upload(inputFile, path, encrypted);
    }
};


