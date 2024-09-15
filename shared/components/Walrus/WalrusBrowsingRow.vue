<template>

<div>
    <q-item class="rowRow" v-if="row.isFull || row.isEnded || true">
        <template v-for="(item, index) in row.items" :key="item.id">
            <WalrusBrowsingItem :item="item" @click="onClick" :width="row.widths[index]" />
        </template>
    </q-item>
</div>

</template>
<style type="text/css">
    .rowRow {
        margin-bottom: 4px;
    }
</style>
<script>
import WalrusBrowsingItem from './WalrusBrowsingItem.vue';

export default {
    name: 'WalrusBrowsingRow',
    props: {
        row: Object,
    },
    emits: ['click', 'back'],
    components: {
        WalrusBrowsingItem,
    },
    data() {
        return {
        }
    },
    watch: {
    },
    methods: {
        onClick(item) {
            this.$emit('click', item);
        },
    },
    mounted() {
    },
    computed: {
    },
}
</script>
