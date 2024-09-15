<template>

    <div style="height: 100%; position: absolute;" :style="{zIndex: zIndex}" class="walrus_browsing" :class="{walrus_browsing_active: isOnFront}">

            <template v-for="row in rows" :key="row.name">
                <WalrusBrowsingRow :row="row" @click="onItemClick" />
            </template>
    </div>

</template>
<script>
// import WalrusBrowsingItem from './WalrusBrowsingItem.vue';
import WalrusBrowsingRow from './WalrusBrowsingRow.vue';
import SuidoubleWalrusRowBuilder from 'shared/classes/walrus/SuidoubleWalrusRowBuilder.js';
import { ref } from 'vue'

class BackItem extends EventTarget {
    constructor(parentPath) {
        super();
        this.isBackButton = true;
        this.fullPath = parentPath;
        this.ratio = 1;
    }
}

export default {
	name: 'WalrusBrowsing',
    components:{
        WalrusBrowsingRow,
    },
	props: {
        site: Object,
	},
	data() {
		return {
            isOnFront: false,
            zIndex: 9000,
            random: Math.random(),

            walrusSiteFolder: null,
            // items: [],

            rows: [],
            rowBuilder: null,

            path: null,
        };
	},
	watch: {
	},
	methods: {
        onItemClick(item) {
            this.$emit('itemClick', item);
        },
        async prepareNextPendingItem() {
            if (!this.isOnFront) {
                return false;
            }

            try {
                const promises = [];
                const maxParallel = 8;
                for (let i = 0; i < maxParallel; i++) {
                    if (this.__itemsPending.length) {

                        const promise = new Promise((res)=>{
                            try {
                                const item = this.__itemsPending.shift();
                                let smoothingDelay = i * 50; // small delay so the items would not come up in chunks
                                
                                setTimeout(()=>{

                                    let ratio = 1;
                                    if (item.getRatio && item.name != '.hidden') {
                                        item.getRatio()
                                            .then((ratio)=>{
                                                item.ratio = ratio;
                                                this.rowBuilder.push(item);
                                                res();
                                            });
                                    } else {
                                        if (item.name != '.hidden') {
                                            item.ratio = 1;
                                            this.rowBuilder.unshift(item);
                                        }

                                        res();
                                    }

                                }, smoothingDelay);
                            } catch (e) {
                                console.error(e);
                                res();
                            }
                        });

                        promises.push(promise);
                    }
                }

                if (promises.length) {
                    this.$emit('preparing');
                    await Promise.all(promises);
                } else {
                    this.$emit('ready');
                }


                // if (this.__itemsPending.length) {
                //     this.$emit('preparing');
                //     const item = this.__itemsPending.shift();
                //     let ratio = 1;
                //     if (item.getRatio) {
                //         // file
                //         if (item.name != '.hidden') {
                //             ratio = await item.getRatio();
                //             item.ratio = ratio;
                //             this.rowBuilder.push(item);
                //         }
                //     } else {
                //         // folder
                //         item.ratio = 1;
                //         this.rowBuilder.unshift(item);
                //     }
                // } else {
                //     this.$emit('ready');
                // }
            } catch (e) {
                console.error(e);
            }
            setTimeout(this.prepareNextPendingItem, 50);
        },
        async setPath(path) {
            if (this.path === path) {
                return true;
            }
            if (!this.site) {
                return false;
            }

            this.path = path;
            // this.items = [];

            this.__itemsPending = [];
            this.rowBuilder.empty();

            this.walrusSiteFolder = this.site.getFolder(path);
            console.error('found folder', this.walrusSiteFolder);
            if (this.walrusSiteFolder.parent) {
                this.__itemsPending.push(new BackItem(this.walrusSiteFolder.parent.fullPath));
            }

            const resources = this.walrusSiteFolder.resources;
            const folders = this.walrusSiteFolder.folders;
            for (const key in resources) {
                this.__itemsPending.push(resources[key]);
            }
            for (const key in folders) {
                this.__itemsPending.push(folders[key]);
            }
            this.walrusSiteFolder.addEventListener('resource', this.__newResourceListener);
            this.walrusSiteFolder.addEventListener('folder', this.__newResourceListener);


            return true;
        },
        async bringToFront() {
            this.isOnFront = true;
            this.prepareNextPendingItem();
            await new Promise((res)=>setTimeout(res, 300));
            this.zIndex = 9001;
        },
        async sendToBack() {
            this.isOnFront = false;
            await new Promise((res)=>setTimeout(res, 300));
            this.zIndex = 9000;
        },
	},
	computed: {
	},
	unmounted: function() {
	},
	mounted: function(){
        this.rowBuilder =  new SuidoubleWalrusRowBuilder();
        this.rows = this.rowBuilder.rows;

        this.__itemsPending = [];
        this.__newResourceListener = (e)=>{
            console.log('------', 'got a resource', e.detail);
            this.__itemsPending.push(e.detail);
        };

	}
}
</script>
<style lang="css">

    .walrus_browsing {
        left: 0;
        right: 0;
        opacity: 0;
        transition: all .3s;
    }

    .walrus_browsing_active {
        opacity: 1;
    }


</style>