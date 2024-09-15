// const CryptoJS = require("crypto-js");
// const Convert = require('./Convert.js');

import cryptoJs from "crypto-js";
const CryptoJS  = cryptoJs;

export default class AES {
	constructor(params = {}) {
		this._key = params.key || null;
		this._password = params.password || null;
		this._kdfSalt = params.kdfSalt || 'todo';
		this._iv = params.iv || null;

		if (!this._key && this._password) {
			this.genKeyFromPassword();
		}

		if (this._key.constructor === Uint8Array) {
			// It's a Uint8Array
			this.getKeyFromUint8Array();
		}

		if (!this._iv) {
			this.genIV();
		} else if (!this._iv.words) {
            this._iv = AES.convertUint8ArrayToWordArray(this._iv);
        }

		// console.error('AES', this._key, this._password, this._iv);
	}

    get ivByteLength() {
        return AES.ivByteLength();
    }

    static ivByteLength() {
        return (CryptoJS.algo.AES.ivSize * 4);
    }

    get iv() {
        return AES.cryptJsWordArrayToUint8Array(this._iv);
    }

	getCryptoParams() {
		return {
			mode: CryptoJS.mode.CTR,
			padding: CryptoJS.pad.NoPadding,  // CTR + NoPadding = same size of cipher and input
			iv: this._iv,
		};
	}

	genKeyFromPassword() {
		this._key = CryptoJS.PBKDF2(this._password, this._kdfSalt, { keySize: CryptoJS.algo.AES.keySize, iterations: 1000 });
	}

	getKeyFromUint8Array() {
		this._key = CryptoJS.PBKDF2(this._key.join(''), this._kdfSalt, { keySize: CryptoJS.algo.AES.keySize, iterations: 1000 });
	}

	genIV() {
		const salt = CryptoJS.lib.WordArray.random(CryptoJS.algo.AES.ivSize);
		this._iv = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: CryptoJS.algo.AES.ivSize, iterations: 1000 });
		this._iv.clamp();
	}

	encrypt(input, finalize = false) {
        const wordArray = input ? AES.convertUint8ArrayToWordArray(input) : null;

		if (!this._encryptor) {
			this._encryptor = CryptoJS.algo.AES.createEncryptor(this._key, this.getCryptoParams());
		}
		if (finalize) {
			if (wordArray) {
				return AES.cryptJsWordArrayToUint8Array(this._encryptor.finalize(wordArray));
			} else {
				return AES.cryptJsWordArrayToUint8Array(this._encryptor.finalize());
			}
		} else {
			return AES.cryptJsWordArrayToUint8Array(this._encryptor.process(wordArray));
		}
	}

	decrypt(input, finalize = false) {
        const wordArray = input ? AES.convertUint8ArrayToWordArray(input) : null;

		if (!this._decryptor) {
			this._decryptor = CryptoJS.algo.AES.createDecryptor(this._key, this.getCryptoParams());
		}
		if (finalize) {
			if (wordArray) {
				return AES.cryptJsWordArrayToUint8Array(this._decryptor.finalize(wordArray));
			} else {
				return AES.cryptJsWordArrayToUint8Array(this._decryptor.finalize());
			}
		} else {
			return AES.cryptJsWordArrayToUint8Array(this._decryptor.process(wordArray));
		}
	}

	static convertUint8ArrayToWordArray(u8Array) {
		let words = [];
		let i = 0, len = u8Array.length;

		while (i < len) {
			words.push(
				(u8Array[i++] << 24) |
				(u8Array[i++] << 16) |
				(u8Array[i++] << 8)  |
				(u8Array[i++])
			);
		}

		return {
			sigBytes: len,
			words: words
		};
	}

    /**
	 * https://github.com/brix/crypto-js/issues/274#issuecomment-600039187
	 * @param  {[type]} wordArray [description]
	 * @return {[type]}           [description]
	 */
	static cryptJsWordArrayToUint8Array(wordArray) {
		if (!wordArray.sigBytes && wordArray.sigBytes !== 0) {
			throw new Error('Invalid WordArray');
		}

		const l = wordArray.sigBytes;
		const words = wordArray.words;
		const result = new Uint8Array(l);
		var i=0 /*dst*/, j=0 /*src*/;
		while(true) {
			// here i is a multiple of 4
			if (i==l)
				break;
			var w = words[j++];
			result[i++] = (w & 0xff000000) >>> 24;
			if (i==l)
				break;
			result[i++] = (w & 0x00ff0000) >>> 16;
			if (i==l)
				break;
			result[i++] = (w & 0x0000ff00) >>> 8;
			if (i==l)
				break;
			result[i++] = (w & 0x000000ff);
		}
		return result;
	}
}

// AES.CryptoJS = CryptoJS;
// AES.ivByteLength = CryptoJS.algo.AES.ivSize * 4;

// module.exports = AES;