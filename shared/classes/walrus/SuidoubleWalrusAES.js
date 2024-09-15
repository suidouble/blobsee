import AbstractCommon from './AbstractCommon.js';
import AES from '../AES.js';
import { enc } from 'crypto-js/core.js';

const BUFFER_SIZE = 100000;

export default class SuidoubleWalrusAES extends AbstractCommon {
    constructor(params = {}) {
        super(params);
    }

    static async hashKeyMessage(inputFile) {
        const prefix = 'BLOBSEE | Generate Encryption/Decryption Key for a Blob of size: ';
        if (inputFile.size) {
            // it's a File
            return (new TextEncoder().encode(prefix+inputFile.size));
        } else if (inputFile.length) {
            // it's an Uint8Array
            // so it has iv prepended
            const size = inputFile.length - AES.ivByteLength();
            return (new TextEncoder().encode(prefix+size));
        }
    }

    static async decrypt(bytes, key) {
        const iv = bytes.slice(0, AES.ivByteLength());
        const decryptor = new AES({
            password: key,
            iv: iv,
        });

        const bodySize = bytes.length;
        const resultSize = bytes.length - decryptor.ivByteLength;
        const ret = new Uint8Array(resultSize);

        let retOffset = 0;
        let offset = decryptor.ivByteLength;

        for (let i = offset; i < bodySize; i+= BUFFER_SIZE) {
            let copySize = BUFFER_SIZE;
            if (i + BUFFER_SIZE > bodySize) {
                copySize = bodySize - i;
            }
            let chunk = bytes.slice(i, i + copySize);
            console.error('bytes', bytes);
            console.error('chunk', chunk);
            const decrypted = await decryptor.decrypt(chunk);
            console.error('decrypted', decrypted);
            ret.set(decrypted, retOffset);

            retOffset += (decrypted.length);
        }

        const final = decryptor.decrypt(null, true);
        if (final && final.length) {
            ret.set(final, retOffset);
        }

        return ret;
    }

    static async encrypt(inputFile, key) {
        const encryptor = new AES({
			// key: this._key,
			// password: this._password,
			password: key,
			// iv: this._iv,
		});

        const bytes = await new Promise((res)=>{
            const reader = new FileReader();
            reader.onload = function(){
                const arrayBuffer = this.result;
                const bytes = new Uint8Array(arrayBuffer);
                res(bytes);
            };
            reader.readAsArrayBuffer(inputFile);
        });

        const bodySize = bytes.length;
        const resultSize = bodySize + encryptor.ivByteLength;
        const ret = new Uint8Array(resultSize);

        ret.set(encryptor.iv, 0);
        let retOffset = encryptor.ivByteLength;

        for (let i = 0; i < bodySize; i+= BUFFER_SIZE) {
            let copySize = BUFFER_SIZE;
            if (i + BUFFER_SIZE > bodySize) {
                copySize = bodySize - i;
            }

            const chunk = bytes.slice(i, i + copySize);
            const encryptedChunk = encryptor.encrypt(chunk);

            ret.set(encryptedChunk, retOffset);

            retOffset += (encryptedChunk.length);
        }

        const final = encryptor.encrypt(null, true);
        if (final && final.length) {
            ret.set(final, retOffset);
        }

        return ret;
    }
}