<template>

  <!-- <q-footer reveal elevated> -->
  <q-footer reveal style="">
    <q-toolbar>
      <q-toolbar-title>


        <div class="fit row no-wrap justify-center items-start content-start">

          <q-btn flat type="a" href="https://github.com/suidouble/blobsee" label="GitHub" />
          <q-btn flat type="a" href="https://info.breakingtheice.sui.io/" label="Breaking the Ice" />
          <q-btn flat type="a" href="https://walrus.site/" label="Walrus" />

        </div>

      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<script>

export default {
  name: 'Footer',
  components: {
  },
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .q-footer {
    backdrop-filter: var(--brand-back-filter);
    background: var(--brand-header-color);
    color: var(--on-brand-text-color);
  }

  .body--dark .q-footer {
    backdrop-filter: var(--brand-back-filter);
    background-color: var(--brand-header-color-dark);
    color: var(--on-brand-text-color-dark);
  }

</style>