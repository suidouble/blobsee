

export default class ThumbGenerator {
	constructor() {
		this._blobs = {};
		this._blobURLs = {};
	}

	async getVideoBlob(url) {
		let video = document.createElement('video');

		let mediaWidth = 0;
		let mediaHeight = 0;
		let mediaDuration = 0;
		let thumbBlob = null;

		await new Promise((res,rej)=>{
			video.addEventListener('error', function(event) {
				console.error(event);

				rej();
			}, true);

			video.onloadeddata = () => {

				let width = video.videoWidth;
				let height = video.videoHeight;

				mediaWidth = width;
				mediaHeight = height;
				mediaDuration = video.duration;

				let canvasWidth = (mediaWidth > mediaHeight) ? 200*(mediaWidth / mediaHeight) : 200;
				let canvasHeight = (mediaWidth > mediaHeight) ? 200 : 200*(mediaHeight / mediaWidth);

				let canvas = document.createElement('canvas');
				canvas.width = canvasWidth;
				canvas.height = canvasHeight;

				let ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = true;
				ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

				let blankCanvas =  document.createElement('canvas');
				blankCanvas.width = canvasWidth;
				blankCanvas.height = canvasHeight;

				if (canvas.toDataURL() == blankCanvas.toDataURL()) {
					rej();
				}

				canvas.toBlob((canvasBlob)=>{
						thumbBlob = canvasBlob;
						// const thumbURL = URL.createObjectURL(canvasBlob);
						// res(thumbURL);
						res(true);
					}, 'image/jpeg', 0.9);
			};

			video.preload = 'metadata';
			video.src = url;
			// Load video in Safari / IE11
			video.muted = true;
			video.playsInline = true;
			video.play();
		});

		return {
			blob: thumbBlob,
			width: mediaWidth,
			height: mediaHeight,
		};
	}

	async getThumbBlob(params = {}) {
		let url = params.url || null;
		const cacheKey = params.cacheKey || params.url || null;
		const maxDim = params.maxDim || 0;

		if (cacheKey && this._blobURLs[cacheKey]) {
			return this._blobURLs[cacheKey];
		}

		let needToRevokeURL = false;
		if (params.file) {
			url = URL.createObjectURL(params.file);
			needToRevokeURL = true;
		}

		if (!url) {
			throw new Error('url parameter is required');
		}
		if (!maxDim) {
			throw new Error('maxDim parameter is required');
		}

		const image = new Image();

		await new Promise((res,rej)=>{
			image.onload = ()=>{
				res();
			};
			image.onerror = ()=>{
				rej();
			};
			image.src = url;
		});

		let width = maxDim;
		let height = maxDim;

		if (image.width > image.height) {
			height = maxDim * (image.height / image.width);
		} else {
			width = maxDim * (image.width / image.height);
		}

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");

		ctx.drawImage(image, 0, 0, width, height);

		// return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

		const blob = await new Promise((res)=>{
			canvas.toBlob((canvasBlob)=>{
				res(canvasBlob);
			}, 'image/png');
		});

		if (needToRevokeURL) {
			URL.revokeObjectURL(url);
		}

		this._blobs[cacheKey] = blob;

		return {
			blob,
			width,
			height,
		};

		// const blobURL = window.URL.createObjectURL(blob);

		// this._blobURLs[cacheKey] = blobURL;

		// return blobURL;
	}
}