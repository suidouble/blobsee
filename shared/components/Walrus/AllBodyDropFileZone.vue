<template>
	<div class="all_body_drop_zone" :class="{all_body_drop_zone_dragging: isDragging}">

        <WalrusUploadSelectTypeDialog ref="dialog" />
	</div>
</template>
<style lang="css">
    .all_body_drop_zone {
    }

    .all_body_drop_zone_dragging {
    }

    .all_body_drop_zone_inner {
        position: absolute;
        top: 50%;
        left: 50%;
    }

    .all_body_drop_zone_inner_block {
        margin-left: -50%;
        margin-top: -45vh;
        background: red;
        width: 80vw;
        height: 80vh;
    }

</style>
<script>
import WalrusUploadSelectTypeDialog from './WalrusUploadSelectTypeDialog.vue';

export default {
	name: 'AllBodyDropFileZone',
	props: {
		value: {
		},
	},
	emits: ['file'],
	computed: {
	},
    data() {
        return {
            isDragging: false,
        }
    },
	components: {
        WalrusUploadSelectTypeDialog,
	},
	methods: {
        async theFile(file) {
            const type = await this.$refs.dialog.ask();

            this.$emit('file', {file, type});
        },
		detachAllBodyHandler() {
			window.removeEventListener('dragenter', this.__dragenterHandler);
			window.removeEventListener('dragover', this.__dragoverHandler);
			window.removeEventListener('dragleave', this.__dragleaveHandler);
			window.removeEventListener('drop', this.__dropHandler);
		},
		attachAllBodyHandlers() {
			if (!this.__dragenterHandler) {
				this.__fileNumber = 0;
				this.__dragenterHandler = (ev)=>{
					if (!ev.dataTransfer) {
						return;
					}
					ev.stopPropagation();
					ev.preventDefault();

					this.isDragging = true;
					this.__fileNumber++;
					ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
				};
				this.__dragoverHandler = (ev)=>{
					if (!ev.dataTransfer) {
						return;
					}
					ev.stopPropagation();
					ev.preventDefault();

					this.isDragging = true;
					ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
				};
				this.__dragleaveHandler = (ev)=>{
					if (!ev.dataTransfer) {
						return;
					}
					this.__fileNumber--;
					if (this.__fileNumber === 0) {
						this.isDragging = false;
					}
				};
				this.__dropHandler = (ev)=>{
					ev.preventDefault();
					this.isDragging = false;

					// let filesCount = 0;
					if (ev.dataTransfer.items) {
						// Use DataTransferItemList interface to access the file(s)
						for (let i = 0; i < ev.dataTransfer.items.length; i++) {
							// If dropped items aren't files, reject them
							if (ev.dataTransfer.items[i].kind === 'file') {
								const file = ev.dataTransfer.items[i].getAsFile();
								// this.$emit('file', file);
                                this.theFile(file);
								// filesCount++;
							}
						}
					} else {
						// Use DataTransfer interface to access the file(s)
						for (let i = 0; i < ev.dataTransfer.files.length; i++) {
							// console.log('... 2 file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
							this.$emit('file', ev.dataTransfer.files[i]);
                            this.theFile( ev.dataTransfer.files[i]);
							// filesCount++;
						}
					}
				};
			}

			window.addEventListener('dragenter', this.__dragenterHandler);
			window.addEventListener('dragover', this.__dragoverHandler);
			window.addEventListener('dragleave', this.__dragleaveHandler);
			window.addEventListener('drop', this.__dropHandler);
		}
	},
	mounted() {
		this.attachAllBodyHandlers();
	},
	unmounted() {
		this.detachAllBodyHandler();
	},
}
</script>