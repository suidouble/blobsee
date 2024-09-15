<template>

	<q-dialog v-model="showing" position="bottom" @hide="onHide">
		<q-card style="min-width: 50vw; max-width: 80vw;">
			<q-linear-progress :value="0.6" color="primary" />
			<q-card-section class="mediaBrowserDisplay">
				<img :src="imageSrc" v-if="showingType == 'photo' && imageSrc" style="height: 500px; max-height: 80vh;" />
				<video :src="videoSrc" v-if="showingType == 'video' && videoSrc" controls  download="video.mp4" />
			</q-card-section>

			<q-card-section class="mediaBrowserDisplay" v-if="isLoading">
				<q-spinner-dots color="primary" size="2em" />
			</q-card-section>
			<q-space />


<!-- 
			<q-card-section class="text-center	">
				<q-btn v-if="!showingPrivate" flat color="primary" icon="lock_open" @click="onShowUnlock" :disabled="!thereMayBeSomethingEncoded" label="unlock private media" />
				<q-btn v-if="showingPrivate" flat color="primary" icon="lock" @click="onShowUnlock" :disabled="true" :ripple="false" label="showing private media" />
			</q-card-section> -->
		</q-card>

	</q-dialog>

</template>
<style type="text/css">
	.mediaBrowserDisplay {
		text-align: center;
	}

	.mediaBrowserDisplay img {
		max-height: 70vh;
		max-width: 100%;
	}

	.mediaBrowserDisplay video {
		max-height: 70vh;
		max-width: 100%;
	}

</style>
<script>

export default {
	props: {
		// ...your custom props
		resource: Object,
	},

	components: {
	},

	emits: ['hide'],

	data() {
		return {
			showing: false,
			resourceToShow: null,

			showingType: null,
			videoSrc: null,
			imageSrc: null,

			thereMayBeSomethingEncoded: false,

			showingPrivate: false,
			isLoading: false,
		}
	},

	methods: {
		async initialize() {
		},
		onHide() {
			this.$emit('hide');
		},
	},

	watch: {
        async resource() {
            if (this.resource) {
                this.resourceToShow = this.resource;
                const isImage = await this.resource.isImage();
                const isVideo = await this.resource.isVideo();
				this.showingType = null;
                this.showing = true;
				this.isLoading = true;
                if (isImage) {
                    this.imageSrc = await this.resource.getBytesBlobURL();
                    this.showingType = 'photo';
                } else if (isVideo) {
					this.videoSrc = await this.resource.getVideoPlayURL();
                    this.showingType = 'video';
				}
				this.isLoading = false;
            } else {
                this.resourceToShow = null;
                this.showing = false;
            }
        },
		// async file() {
		// 	if (this.file) {
		// 		const tgFile = new TelegramFile({
		// 			file: this.file,
		// 			id: (''+Math.random()),
		// 		});

		// 		this.telegramFileToShow = tgFile;
		// 		this.thereMayBeSomethingEncoded = false;

		// 		this.showingType = await this.telegramFileToShow.getType();
		// 		if (this.showingType == 'video') {
		// 			this.videoSrc = window.URL.createObjectURL(this.file);
		// 			this.thereMayBeSomethingEncoded = true;
		// 		} else if (this.showingType == 'photo') {
		// 			this.imageSrc = window.URL.createObjectURL(this.file);
		// 		}
		// 		this.showing = true;
		// 		this.showingPrivate = false;
		// 	} else {
		// 		this.showing = false;
		// 	}
		// },
	}
}
</script>