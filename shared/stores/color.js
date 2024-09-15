import { defineStore } from 'pinia';

export const useColorStore = defineStore('color', {
	// convert to a function
	state: () => ({
		color: null,
	}),
	getters: {
		// color: function(){ // using this to watch
		// 	return ''+this.signedAddress+'_'+this.chainType;
		// },
	},
	actions: {
		setColor(color) {
			this.color = color;
		},
	},
});