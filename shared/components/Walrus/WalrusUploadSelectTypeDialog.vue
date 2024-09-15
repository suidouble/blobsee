<template>
	<!-- notice dialogRef here -->
	<q-dialog ref="dialog" @hide="onDialogHide">
		<div  class="q-dialog-plugin non-selectable"  style="width: 50vw;">
			<q-card>
				<q-list>
					<q-item clickable v-ripple @click="onPublic">
                        <q-item-section>
                        <q-item-label>Public Upload</q-item-label>
                        <q-item-label caption>anybody can view and download the file</q-item-label>
                        </q-item-section>
					</q-item>
					<q-item clickable v-ripple @click="onEncrypted">
                        <q-item-section>
                        <q-item-label>Encrypted Upload</q-item-label>
                        <q-item-label caption>blob will be encrypted with your wallet</q-item-label>
                        </q-item-section>
					</q-item>
				</q-list>

			</q-card>
		</div>

	</q-dialog>
</template>
<style type="text/css">
</style>
<script>

export default {
	props: {
	},
	components: {
	},
	emits: [
		// REQUIRED
		'ok', 'hide'
	],
    data() {
        return {
        }
    },

	methods: {
        onPublic() {
            this.___promiseResolver('public');
			this.$refs.dialog.hide();
        },
        onEncrypted() {
            this.___promiseResolver('encrypted');
			this.$refs.dialog.hide();
        },
		async ask() {
			this.$refs.dialog.show();
            this.___promiseResolver = null;
            this.___promise = new Promise((res)=>{
                this.___promiseResolver = res;
            });
            return await this.___promise;
		},
		hide () {
			this.$refs.dialog.hide();
		},
		onDialogHide () {
			this.$emit('hide')
		},
	}
}
</script>