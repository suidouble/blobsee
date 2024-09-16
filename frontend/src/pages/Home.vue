<template>

    <div>
        <WalrusSitesSelector v-if="!siteId" />
        <WalrusSite :id="siteId" v-if="siteId" />
    </div>

</template>

<script>
import WalrusSitesSelector from 'shared/components/Walrus/WalrusSitesSelector.vue';
import WalrusSite from 'shared/components/Walrus/WalrusSite.vue';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        // WalrusSite,
        WalrusSite,
        WalrusSitesSelector,
    },
	data() {
		return {
            chain: 'sui:testnet',
            siteId: null,
		}
	},
	methods: {
        async switchTo(chainName) {
            this.chain = null;
            await new Promise((res)=>setTimeout(res, 500));
            this.chain = chainName;
        },
        onSuiStatsAddress(suiStatsAddress) {
            this.suiStatsAddress = suiStatsAddress;
        },
        checkRoute() {
            if (this.$route.query.site) {
                this.siteId = this.$route.query.site;
            } else {
                this.siteId = null;
            }
        },
	},
    watch: {
        siteRoute() {
            this.checkRoute();
        }
    },
    computed: {
        siteRoute() {
            return this.$route.query.site;
        }
    },
    beforeMount() {
    },
    mounted() {
        this.checkRoute();
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

    .fileInput {
        display: none;
    }

</style>

