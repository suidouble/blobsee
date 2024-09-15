<template>

    <q-card class="drive-folder" @click="onClick" v-if="!isBackButton && !isFolder && isImage && !isEncrypted" :style="{width: (width + '%')}">
        <div class="drive-folder-inner">
            <q-img :src="previewImage" v-if="previewImage" >
                <div class="absolute-center" style="background: transparent;" v-if="isVideo">
                    <q-icon name="play_arrow" color="white" size="90px" class="absolute-center  " />
                </div>
                <div class="absolute-bottom text-subtitle2 text-center folderTitle">
                    {{ title }}
                </div>
            </q-img>
        </div>
    </q-card>
    <q-card class="drive-folder" @click="onClick" v-if="!isBackButton && !isFolder && isEncrypted">
        <div class="q-img">
            <q-icon name="lock" color="primary" size="4.4em" class="absolute-center   " />
                <div class="absolute-bottom text-subtitle2 text-center folderTitle">
                    {{ title }}
                </div>
        </div>
    </q-card>
    <q-card class="drive-folder" @click="onClick" v-if="!isBackButton && !isFolder && !isImage && !isEncrypted">
        <div class="q-img">
            <q-icon name="description" color="primary" size="4.4em" class="absolute-center   " />
                <div class="absolute-bottom text-subtitle2 text-center folderTitle">
                    {{ title }}
                </div>
        </div>
    </q-card>
    <q-card class="drive-folder" @click="onClick" v-if="isBackButton">
        <div class="q-img">
            <q-icon name="arrow_back" color="primary" size="4.4em" class="absolute-center   " />
        </div>
    </q-card>
    <q-card class="drive-folder" @click="onClick" v-if="isFolder">
        <div class="q-img">
            <q-icon name="folder" color="primary" size="4.4em" class="absolute-center   " />
                <div class="absolute-bottom text-subtitle2 text-center folderTitle">
                    {{ title }}
                </div>
        </div>
    </q-card>

</template>

<script>
export default {
    name: 'WalrusBrowsingItem',
    props: {
        item: Object,
        width: Number,
    },
    components: {
    },
    emits: ['click'],
    data() {
        return {
            initialized: false,
            name: '',
            previewImage: null,
            placeholderPreviewImage: null,
            contentType: null,

            isImage: false,
            isVideo: false,
            isEncrypted: false,
        }
    },
    watch: {
    },
    methods: {
        onClick() {
            this.$emit('click', this.item);
        },
        async init() {
            if (this.item.isFile) {
                const isEncrypted = await this.item.isEncrypted();
                this.isEncrypted = isEncrypted;

                const isImage = await this.item.isImage();
                const isVideo = await this.item.isVideo();


                if ((isImage || isVideo) && !isEncrypted) {
                    this.previewImage = await this.item.getThumbBlobURL();
                    this.isImage = true;
                }

                this.isVideo = isVideo;
            }


            // if (this.item.getContentType) {
            //     // is file
            //     this.contentType = await this.item.getContentType();
            //     this.previewImage = await this.item.getThumbBlobURL();
            // }
        },
    },
    created() {
    },
    mounted() {
        this.init();
    },
    unmounted() {
    },
    computed: {
        isFolder() {
            if (this.item && this.item.isFolder && !this.item.isBackButton) {
                return true;
            }
            return false;
        },
        isBackButton() {
            if (this.item && this.item.isBackButton) {
                return true;
            }
            return false;
        },
        title() {
            if (this.item) {
                if (this.item.fullPath) {
                    return this.item.name;
                } else if (this.item.path) {
                    return (''+this.item.name).split('.encrypted').join('');
                }
            }
        }
    },
}
</script>
