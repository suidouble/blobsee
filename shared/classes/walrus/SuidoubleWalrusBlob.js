
export default class SuidoubleWalrusBlob {
    constructor(params = {}) {
        this._suidoubleWalrus = params.suidoubleWalrus;
        this._id = params.id;
    }

    get suiMaster() {
        return this._suidoubleWalrus._suiMaster;
    }

    async get() {
        const obj = await this.suiMaster.client.getObject({
            id: this._id,
            options: { showBcs: true },
        });

        console.log(obj);

        // const SuiObject = this.suiMaster.SuiObject;
        // const suiObject = new SuiObject({
        //         id: this._id,
        //         suiMaster: this.suiMaster,
        //     });
        // await suiObject.fetchFields();

        // return suiObject;
    }

};