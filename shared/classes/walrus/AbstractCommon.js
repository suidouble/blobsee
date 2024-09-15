
import { bcs } from "@mysten/bcs";

class CustomEvent extends Event { 
	constructor(message, data) {
		super(message, data)
		this.detail = data.detail
	}
}

export default class AbstractCommon extends EventTarget {
	constructor(params = {}) {
		super();

		this._singleThreads = {

		};
		this._debug = params.debug || false;
	}

	// bigintToHex(v) {
	// 	let hex = BigInt(v).toString(16);
	// 	if (hex.length % 2) { hex = '0' + hex; }
	// 	while (hex.length < 64) { // u64 is 32 bytes 64 chars
	// 		hex = '0' + hex;
	// 	}
	// 	return hex;
	// }

	bigintToUint8Array2(bigint) {
		return bcs.u256().serialize(bigint).toBytes();
	}

	bigintToUint8Array(bigint, forceByteLength = null) {
		// Convert BigInt to hexadecimal string
		let hexString = bigint.toString(16);
		
		// Ensure even number of hex characters (each byte is 2 hex digits)
		if (hexString.length % 2) {
			hexString = '0' + hexString;
		}
		if (forceByteLength) {
			while (hexString.length < forceByteLength*2) { 
				hexString = '0' + hexString;
			}
		}
	
		// Create Uint8Array to hold the byte values
		const byteArray = new Uint8Array(hexString.length / 2);
	
		// Manually convert hexString to bytes
		for (let i = 0; i < hexString.length; i += 2) {
			byteArray[i / 2] = parseInt(hexString[i] + hexString[i + 1], 16);
		}
	
		return byteArray;
	}

	base64UrlSafeDecode(v) {
		const base64 = v.replaceAll("_", "/").replaceAll("-", "+");
		const raw = atob(base64);
		// const rawLength = raw.length;
		const hex = [];
		raw.split('').forEach(function (ch) {
			var h = ch.charCodeAt(0).toString(16);
			if (h.length % 2) { h = '0' + h; }
			hex.unshift(h);
		});
		return BigInt('0x' + hex.join(''));

		const array = new Uint8Array(new ArrayBuffer(rawLength));
		for(let i = 0; i < rawLength; i++) {
			array[i] = raw.charCodeAt(i);
		}
		console.log(array);
		return array;
	}


	log(...args) {
		if (!this._debug) {
			return;
		}

		args.unshift(''+this.constructor.name+' | ');
		console.info.apply(null, args);
	}

    emit(eventTypeName, data = {}) {
        const event = new CustomEvent(eventTypeName, { detail: data });
        this.dispatchEvent(event);
    }

    async threadIsThere(threadId) {
        if (this.isThereSingleThread(threadId)) {
            await this.waitForSingleThread(threadId);
            return true;
        }
        this.createSingleThread(threadId);
        return false;
    }

	isThereSingleThread(threadId) {
		if (this._singleThreads[threadId]) {
			return true;
		}

		return false;
	}

	async waitForSingleThread(threadId) {
		if (this._singleThreads[threadId]) {
			return await this._singleThreads[threadId].promise;
		}
	}

	createSingleThread(threadId) {
		this._singleThreads[threadId] = {};
		this._singleThreads[threadId].promise = new Promise((res)=>{
			this._singleThreads[threadId].resolver = res;
		});
	}

	resolveSingleThread(threadId, data) {
		if (this._singleThreads[threadId]) {
			this._singleThreads[threadId].resolver(data);
		}
	}

	getCached(cacheId, cacheLifetime) {
		const cachedAt = parseInt(localStorage.getItem(cacheId+'_at'), 10);
		const cached = localStorage.getItem(cacheId);

		if (cached && Math.abs((new Date(cachedAt)).getTime() - (new Date()).getTime()) < cacheLifetime) {
			return cached;
		}

		return null;
	}

	setCache(cacheId, object) {
		localStorage.setItem(cacheId, object);
		localStorage.setItem(cacheId+'_at', (new Date()).getTime());
	}

	clearCache(cacheId) {
		localStorage.removeItem(cacheId);
		localStorage.removeItem(cacheId+'_at');
	}

}