<template>
  <v-card>
    <v-card-title primary-title class="secondary--text display-1">
      <v-flex text-xs-center>Initializing your wallet...</v-flex>
    </v-card-title>
    <v-card-text>
      <v-layout wrap>
        <v-flex xs12 text-xs-center my-5>
          <v-progress-circular :size="200" :width="10" color="secondary" indeterminate></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Introduction',
  props: ['active', 'password', 'seed', 'backup'],
  watch: {
    async active() {
      if (this.active) {
        setTimeout(async () => {
          await this.$store.dispatch('init', {
            password: this.password,
            seed: this.seed,
            backup: this.backup
          });
          this.$router.replace({ name: 'Factoid', query: { view: 'addresses' } });
          this.$store.commit('showAppSideBar');
        }, 500);
      }
    }
  }
};
</script>

<style scoped></style>
