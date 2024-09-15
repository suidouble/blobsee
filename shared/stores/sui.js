import { defineStore } from 'pinia';

import Log from 'shared/classes/Log.js';

export const useSuiStore = defineStore('sui', {
	// convert to a function
	state: () => ({
		address: null,
        connectedChain: null,
        suiMaster: null,

		amount_sui: 0,
		amount_sui_string: '-1',
		amount_sui_loading: true,
		amount_sui_time: null,
		amount_sui_timeout: 10000,
	}),
	getters: {
		connectionId: function(){ // using this to watch
			return ''+this.address+'_'+this.connectedChain;
		},
	},
	actions: {
		async getSuiBalance() {
			if (this.amount_sui_time && this.amount_sui) {
				const now = (new Date()).getTime();
				if ((now - this.amount_sui_time) < this.amount_sui_timeout) {
					return this.amount_sui;
				}
			}

			Log.tag('$store.sui').info('getting current SUI balance');

			this.amount_sui_loading = true;
			try {
				const balance = await this.suiMaster.getBalance('sui');
				this.amount_sui = balance;
				this.amount_sui_string = await this.amountToString(this.amount_sui);

				Log.tag('$store.sui').info('current SUI balance is', this.amount_sui_string);

				// alert(balance);
			} catch(e) {
				console.error(e);
			}
			this.amount_sui_loading = false;
			this.amount_sui_time = (new Date()).getTime();

			return this.amount_sui;
		},
		urlToExplorer(params = {}) {
			const id = params.id;
			const type = params.type || 'object';

			const chainString = (''+this.connectedChain).split('sui:').join('');

			return 'https://suiscan.xyz/'+chainString+'/'+type+'/'+id;
		},
		async request() {
			Log.tag('$store.sui').info('sui connection requested');

			if (this.suiMaster && this.suiMaster.address) {
				return true;
			}

			if (!this.__requestConnectionPromise) {
				this.__requestConnectionPromiseResolver = null;
				this.__requestConnectionPromise = new Promise((res)=>{
					this.__requestConnectionPromiseResolver = res;
				});
			}

			await this.__requestConnectionPromise;
			this.__requestConnectionPromise = null;
			this.__requestConnectionPromiseResolver = null;

			return true;
		},
		setSuiMaster(suiMaster) {
			clearTimeout(this.__setSuiMasterTimeout);

			let thisTimeoutMs = 800;
			if (suiMaster.address) {
				thisTimeoutMs = 100;
			}

			this.__setSuiMasterTimeout = setTimeout(()=>{

				this.suiMaster = suiMaster;
				if (suiMaster.address) {
					Log.tag('$store.sui').info('your address', suiMaster.address);
					this.address = suiMaster.address;
				} else {
					this.address = null;
				}
				if (suiMaster.connectedChain) {
					
					Log.tag('$store.sui').info('got suiMaster connected to ', suiMaster.connectedChain);
					this.connectedChain = suiMaster.connectedChain;
					this.getSuiBalance()
						.then(()=>{
							// all is ready
							if (this.__requestConnectionPromiseResolver) {
								this.__requestConnectionPromiseResolver();
							}
						});
				} else {
					Log.tag('$store.sui').info('suiMaster unset');
					this.connectedChain = null;
				}
			}, thisTimeoutMs);
		},
		async amountToString(amount) {
			const suiCoin = this.suiMaster.suiCoins.get('sui');
			await suiCoin.getMetadata();

			return suiCoin.amountToString(amount);
		}
	},
});