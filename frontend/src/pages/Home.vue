<template>

    <div>
        <WalrusSitesSelector />
    </div>

</template>

<script>
import WalrusSitesSelector from 'shared/components/Walrus/WalrusSitesSelector.vue';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        // WalrusSite,
        WalrusSitesSelector,
    },
	data() {
		return {
            chain: 'sui:testnet',
		}
	},
    watch: {
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
	},
    computed: {
    },
    beforeMount() {
    },
    mounted() {
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

    .fileInput {
        display: none;
    }

</style>

