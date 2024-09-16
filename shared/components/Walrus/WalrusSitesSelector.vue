<template>

    <q-list bordered>
        <q-item-label header v-if="connectedChain !== 'sui:testnet'">Please switch to testnet</q-item-label>

        <div v-if="connectedChain == 'sui:testnet'">
        <q-item-label header>Your Sites</q-item-label>

        <q-item class="q-mb-sm" clickable v-ripple @click="onNewSiteClick" v-if="connected">
            <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                    +
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>New Site</q-item-label>
                <q-item-label caption lines="1">Create new Walrus Site</q-item-label>
            </q-item-section>

        </q-item>

        <q-item class="q-mb-sm" clickable v-ripple @click="onConnect" v-if="!connected">
            <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                    -
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>Connect</q-item-label>
                <q-item-label caption lines="1">Connect with wallet to see your Walrus Sites</q-item-label>
            </q-item-section>

        </q-item>


        <q-item v-for="site in yours" :key="site.id" class="q-mb-sm" clickable v-ripple :to="'/?site='+site.id">
            <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                    Q
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{site.id}} {{ site.name }}</q-item-label>
                <q-item-label caption lines="1">{{ site.description }}</q-item-label>
            </q-item-section>

        </q-item>

        <q-separator />

        <q-item-label header>Sample Sites</q-item-label>
        <q-item v-for="site in samples" :key="site.id" class="q-mb-sm" clickable v-ripple :to="'/?site='+site.id">
            <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                    Q
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label>{{site.id}} {{ site.name }}</q-item-label>
                <q-item-label caption lines="1">{{ site.description }}</q-item-label>
            </q-item-section>

        </q-item>
        </div>
    </q-list>

</template>
<script>
import SuidoubleWalrus from 'shared/classes/walrus/SuidoubleWalrus.js';

export default {
	name: 'WalrusSiteSelector',
    components:{
    },
	props: {
	},
	data() {
		return {
            samples: [
                {id: '0x4e188dfef8953a1053fe61e2bd9bfb4fd5d2fbad36155ee0c398b2723b4ab509', name: 'this site', description: 'this site'},
                {id: '0xa76017588b6607cbd614727376e6f279ff319287438115dc6d8e5c05bcc7b47c', name: 'gallery.walrus.site', description: 'gallery.walrus.site'},
                {id: '0xb9fcca4e5edb0c19c8a5c4e32f3ba90b3f7fbfd92d3400a3d56a3fa03439ec21', name: 'breaking the ice', description: 'breakingtheice.walrus.site'},
                {id: '0x4b84f3d8225ef80e186ea185c743b35c5c0570031bdcc0171a4f124cefe8362d', name: 'myfirst', description: 'snake game'},
                {id: '0x39034b07ad7bedc4ac6b939f2499e280b963ce013ce6456bc7e8cd0e1d3feba0', name: 'docs.walrus.site', description: 'walrus documentation by Mysten'}
            ],
            yours: [

            ],
            isLoading: false,
            sWalrus: null,
        };
	},
	methods: {
        async onConnect() {
            this.$store.sui.request();
        },
        onNewSiteClick() {
            this.$q.dialog({
                title: 'Create New Walrus Site',
                message: 'Site Name',
                prompt: {
                    model: '',
                    isValid: val => val.length > 1, // << here is the magic
                    type: 'text' // optional
                },
                cancel: true,
                persistent: true
                }).onOk(data => {
                    this.isLoading = true;
                    this.sWalrus.sites.create(data)
                        .then((site)=>{
                            console.error(site);
                            this.reInit();
                        });
                    // console.log('>>>> OK, received', data)
                });
        },
        async reInit() {
            const suiMaster = this.$store.sui.suiMaster;
            if (!suiMaster) {
                this.yours = [];
                return false;
            }

            const sWalrus = new SuidoubleWalrus({
                suiMaster: suiMaster,
                config: {test: true,},
            });
            this.sWalrus = sWalrus;
            const sites = await sWalrus.sites.getOwned();
            this.yours = [];
            for (const site of sites) {
                this.yours.push({
                    id: site.id,
                    name: site.name,
                    description: site.name,
                });
            }
        },
	},
	watch: {
        connectionId() {
            this.reInit();
        },
	},
	computed: {
        connectedChain: function() {
            return this.$store.sui.connectedChain;
        },
        connectionId: function() {
            return this.$store.sui.connectionId;
        },
        connected: function() {
            return this.$store.sui.address;
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



</style>