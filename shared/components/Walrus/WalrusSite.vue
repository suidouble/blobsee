<template>

    <div>
        <q-toolbar class="bg-primary text-white non-selectable">
            <q-toolbar-title>
            <q-breadcrumbs active-color="white" style="font-size: 16px">
                <q-breadcrumbs-el label="Walrus Sites" @click="onBack" style="cursor: pointer;" class="gt-sm" />
                <q-breadcrumbs-el :label="id" icon="folder_open" />
                <q-breadcrumbs-el icon="link" :href="siteURL" target="_blank" style="cursor: pointer;" class="gt-sm" />
                <q-breadcrumbs-el class="gt-sm" v-if="isPreparing">
                   <q-spinner-dots color="white" size="2em" />
                </q-breadcrumbs-el>
                <template v-slot:separator>
                </template>
            </q-breadcrumbs>
            </q-toolbar-title>


            <q-btn color="white" text-color="primary" unelevated class="q-mr-xs"
                icon="create_new_folder"
                @click="onMakeDirClick" 
                :disable="!isOwner"
                :title="isOwner ? '' : 'Connect as the site owner'"
                >
                Make Dir
            </q-btn>

            <q-btn color="white" text-color="primary" unelevated class="q-mr-xs"
                icon="upload"
                @click="onUploadClick" 
                :disable="!isOwner"
                :title="isOwner ? '' : 'Connect as the site owner'"
                >
                Upload
            </q-btn>
            <input type="file" @change="fileToUploadSelected" class="fileInput" ref="fileInput">


            <q-btn color="white" text-color="primary" unelevated class="q-mr-xs"
                icon="lock"
                @click="onUploadEncryptedClick" 
                :disable="!isOwner"
                :title="isOwner ? '' : 'Connect as the site owner'"
                > 
                Upload Encrypted
            </q-btn>
            <input type="file" @change="encryptedFileToUploadSelected" class="fileInput" ref="encryptedFileInput">
        </q-toolbar>

        <div style="position: relative; height: calc(100vh - 230px); overflow-x: hidden; scroll-behavior: smooth; z-index: 500;" ref="scrollDiv" id="drive-scroll">
            <WalrusBrowsing ref="tab_1" :site="site" @itemClick="onItemClick" @preparing="onPreparing" @ready="onReady" />
            <WalrusBrowsing ref="tab_2" :site="site" @itemClick="onItemClick" @preparing="onPreparing" @ready="onReady"  />


            <q-inner-loading :showing="isLoading" style="z-index: 10000">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </div>

        <WalrusMediaBrowser :resource="resourceToBrowse" @hide="resourceToBrowse = null" />

        <AllBodyDropFileZone @file="onDropFile" />
    </div>



</template>
<script>
import WalrusBrowsing from './WalrusBrowsing.vue';
import SuidoubleWalrus from 'shared/classes/walrus/SuidoubleWalrus.js';
import WalrusMediaBrowser from './WalrusMediaBrowser.vue';
import AllBodyDropFileZone from './AllBodyDropFileZone.vue';

export default {
	name: 'WalrusSite',
    components:{
        WalrusBrowsing,
        WalrusMediaBrowser,
        AllBodyDropFileZone,
    },
	props: {
        id: {
            type: String,
            default: '',
        },
	},
	data() {
		return {
            activeTab: 1,
            site: null,
            tab1path: '/',
            tab2path: '/',

            isLoading: true,

            currentFolder: null,

            resourceToBrowse: null,

            isOwner: false,
            isPreparing: false,
        };
	},
	methods: {
        onPreparing() {
            this.isPreparing = true;
        },
        onReady() {
            this.isPreparing = false;
        },
        onBack() {
            this.$router.push('/');
        },
        onMakeDirClick() {
            console.error(this.currentFolder);

            this.$q.dialog({
                title: 'Prompt',
                message: 'Directory Name',
                prompt: {
                    model: '',
                    isValid: val => val.length > 1, // << here is the magic
                    type: 'text' // optional
                },
                cancel: true,
                persistent: true
                }).onOk(data => {
                    const toUp = new Uint8Array([0]);
                    toUp.name = '' + data + '/.hidden';
                    toUp.type = 'text/plain';
                    this.isLoading = true;
                    this.currentFolder.upload(toUp)
                        .then(()=>{
                            this.isLoading = false;
                            this.site.getResources();
                        })
                        .catch((e)=>{
                            this.$q.notify({
                                progress: true,
                                color: "warning",
                                multiLine: true,
                                textColor: "dark",
                                message: (''+e),
                            });
                            console.error(e);
                            this.isLoading = false;
                        });
                    // console.log('>>>> OK, received', data)
                });
        },
        onUploadClick() {
            this.$refs.fileInput.click();
        },
        onUploadEncryptedClick() {
            this.$refs.encryptedFileInput.click();
        },
        onDropFile(params) {
            const file = params.file;
            let encrypted = false; if (params.type == 'encrypted') encrypted = true;
            this.uploadFile(file, encrypted);
        },
        async uploadFile(file, encrypted) {
            this.isLoading = true;
            try {
                await this.currentFolder.upload(file, encrypted);
            } catch (e) {
                this.$q.notify({
                    progress: true,
                    color: "warning",
                    multiLine: true,
                    textColor: "dark",
                    message: (''+e),
                });
                console.error(e);
            }
            this.isLoading = false;

            this.isPreparing = true;
            await new Promise((res)=>setTimeout(res, 1000));
            this.isPreparing = false;
            await this.site.getResources();
        },
        async encryptedFileToUploadSelected(ev) {
            let files = [];
            if (ev.target && ev.target.files) {
                files = ev.target.files;
            } else {
                files.push(ev);
            }
            if (!files[0]) {
                return;
            }
            await this.uploadFile(files[0], true);
        },
        async fileToUploadSelected(ev) {
            let files = [];
            if (ev.target && ev.target.files) {
                files = ev.target.files;
            } else {
                files.push(ev);
            }
            if (!files[0]) {
                return;
            }
            await this.uploadFile(files[0], false);
        },
        async onItemClick(item) {
            console.error('onItemClick', item);

            if (item && (item.fullPath || item.fullPath === '')) {
                // folder

                let otherTab = 1; if (this.activeTab == 1) otherTab = 2;
                await this.$refs['tab_'+otherTab].setPath(item.fullPath);
                this.switchTab();

                const folder = this.site.getFolder(item.fullPath);
                this.currentFolder = folder;
            } else {
                const isImage = await item.isImage();
                const isVideo = await item.isVideo();
                if (isImage || isVideo) {
                    this.resourceToBrowse = item;
                } else {
                    this.isLoading = true;
                    try {
                        await item.download();
                    } catch (e) {
                        console.error(e);
                    }
                    this.isLoading = false;
                }
            }
        },
        async reInit() {
            this.isLoading = true;

            const suiMaster = this.$store.sui.suiMaster;
            if (!suiMaster) {
                this.site = null;
                return false;
            }

            const sWalrus = new SuidoubleWalrus({
                suiMaster: suiMaster,
                config: {test: true,},
            });
            this.site = null;
            this.site = await sWalrus.sites.get(this.id);//'0x1731ceb9849512f28cd8b7031e7dc6774e1cc3afb99c555ecaec3fa15eefa563');

            console.error(this.site);
            //0xb4fe49a14a93e0c36618fe54b6ed13d23a86b0404e6131822bb3300c35862933

            if (this.$store.sui.address) {
                this.isOwner = await this.site.isOwnedBy(this.$store.sui.address);
            } else {
                this.isOwner = false;
            }

            await new Promise((res)=>setTimeout(res, 100));

            this.$refs['tab_'+this.activeTab].setPath('');
            this.$refs['tab_'+this.activeTab].bringToFront();
            this.site.getResources();
            this.currentFolder = this.site.root;

            this.isLoading = false;
            // await this.site._suidoubleWalrusSites.create('test');
        },
        async switchTab() {
            if (this.activeTab == 1) {
                await Promise.all([ this.$refs.tab_1.sendToBack(), this.$refs.tab_2.bringToFront() ]);
                this.activeTab = 2;
            } else {
                await Promise.all([ this.$refs.tab_2.sendToBack(), this.$refs.tab_1.bringToFront() ]);
                this.activeTab = 1;
            }
        }
	},
	watch: {
        connectionId() {
            this.reInit();
        },
	},
	computed: {
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        siteURL: function() {
            if (this.site && this.site.id) {
                return 'https://'+(BigInt(''+this.site.id)).toString(36)+'.walrus.site/';
            }
            return '';
        },
	},
	unmounted: function() {
	},
	mounted: function(){
        this.reInit();
	}
}
</script>
<style lang="css">

    .rowRow {
        margin: 0;
        padding: 0 !important;
    }

    .drive-folder {
        float: left;
        width: 20%;
        cursor: pointer;
        opacity: 1;
        /* transition: opacity 0.5s ease-in-out; */
        text-overflow: ellipsis;
        transition: all 0.5s ease-in-out;
        box-shadow: none !important;
    }
    .q-card {
        padding: 2px;
        box-shadow: none;
    }
    .drive-folder .folderTitle {
        text-overflow: ellipsis;
        height: 45px;
        overflow:hidden;
        white-space:nowrap;
        width: 100%;
    }

    .drive-folder:hover {
        opacity: 0.5;
    }

    .drive-folder .q-img {
        height: 200px;
    }

    .drive-folder-inner {
        padding: 4px;
    }

    .drive-folder-file {
        width: 100%;
        max-width: 250px;
        transition: opacity 0.5s ease-in-out;
    }

    .drive-folder-file:hover {
        opacity: 0.5;
    }

    .drive-folder-file-back {
        position: absolute;
        left: 2px; right: 2px; top: 2px; bottom: 2px;
        border-radius: 4px !important;
        overflow: hidden;
    }


    .drive-folder-file-back img {
        object-position: 50% 50%;
        object-fit: cover;
        width: 100%;
        height: 200px;
        border-radius: 4px !important;
        opacity: 0.3;
    }

    .drive-folder-file-back-blurred img {
        filter: blur(10px);
    }
    
    img {
        height: 200px;
        object-fit: cover;
    }

    @media screen and (max-width: 900px) {
        .drive-folder-file-back img {
            height: 100px;
        }
    }
</style>