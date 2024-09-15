import AbstractCommon from './AbstractCommon.js';
import ThumbGenerator from '../ThumbGenerator.js';

const CACHE_NAME = "suidouble-walrus-cache";

export default class SuidoubleWalrusFetchCached extends AbstractCommon {
    constructor(params = {}) {
        super(params);

        this._cache = null;
    }

    async initialize() {
        if (await this.threadIsThere('initialize')) {
            return true;
        }
        this._cache = await caches.open(CACHE_NAME);
        this.resolveSingleThread('initialize');
        return true;
    }

    async fetch(url) {
        await this.initialize();
        const cachedResponse = await this._cache.match(url);
        if (cachedResponse) {
            return cachedResponse;
        }
        const resp = await fetch(url);
        this._cache.put(url, resp.clone());

        return resp;
    }

    async putToCache(url, file) {
        await this.initialize();
        const cachedResponse = await this._cache.match(url);
        if (cachedResponse) {
            return true;
        }

        const headers = {
            "content-type": file.type,
        };
        const options = { status: 200, headers: headers, };
        const response = new Response(file, options);
        this._cache.put(url, response);

        return true;
    }

    async fetchRatio(url) {
        try {
            const thumb = await this.fetchThumb(url);
            const width = thumb.headers.get('thumb-width');
            const height = thumb.headers.get('thumb-height');
            if (width && height) {
                return width / height;
            }
            return 1;
        } catch (e) {
            console.error(e);
        }
        return 1;
    }

    async fetchVideoThumb(url) {
        await this.initialize();
        const thumbURL = url + '____thumb';
        const cachedResponse = await this._cache.match(thumbURL);
        if (cachedResponse) {
            return cachedResponse;
        }
        const original = await this.fetch(url);
        const body = await original.arrayBuffer();
        const blob = new Blob([body]);
        const blobUrl = URL.createObjectURL(blob);

        const thumbGenerator = new ThumbGenerator();
        console.error(blobUrl);
        console.error(url);
        const thumbResult = await thumbGenerator.getVideoBlob(blobUrl);
        console.error(thumbResult);

        const headers = {
            "content-type": "image/jpeg",
            "thumb-width": parseInt(''+thumbResult.width, 10),
            "thumb-height": parseInt(''+thumbResult.height, 10),
        };
        const options = { status: 200, headers: headers, };

        if (thumbResult) {
            const response = new Response(thumbResult.blob, options);
            this._cache.put(thumbURL, response.clone());
            return response;
        }

        return null;
    }

    async fetchThumb(url) {
        await this.initialize();
        const thumbURL = url + '____thumb';
        const cachedResponse = await this._cache.match(thumbURL);
        if (cachedResponse) {
            return cachedResponse;
        }

        const original = await this.fetch(url);
        const body = await original.arrayBuffer();
        const thumbGenerator = new ThumbGenerator();
        const blob = new Blob([body]);
        const blobUrl = URL.createObjectURL(blob);

        let thumbResult = null;
        try {
            thumbResult = await thumbGenerator.getThumbBlob({
                    url: blobUrl,
                    maxDim: 300,
                });
        } catch (e) {
            console.error(e);
        }

        URL.revokeObjectURL(blobUrl);
        const headers = {
            "content-type": "image/png",
            "thumb-width": parseInt(''+thumbResult.width, 10),
            "thumb-height": parseInt(''+thumbResult.height, 10),
        };
        const options = { status: 200, headers: headers, };

        if (thumbResult) {
            const response = new Response(thumbResult.blob, options);
            this._cache.put(thumbURL, response.clone());
            return response;
        }

        return null;
    }

};