<template>
  <v-container>
    <v-layout justify-center column>
      <v-flex>
        <v-card>
          <v-card-title>
            <span class="headline">Track an existing token</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model.trim="tokenChainId"
                :rules="tokenChainIdRules"
                label="Token chain ID"
                counter="64"
                len
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn :disabled="!valid" @click="submit">track</v-btn>
            <v-btn @click="clear">clear</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex ma-5 pa-3>
        <v-divider></v-divider>
      </v-flex>

      <v-flex text-xs-center>
        <v-btn large :to="{name: 'IssueToken'}">Issue a new Token</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "AddToken",
  data: () => ({
    valid: true,
    tokenChainId: "",
    tokenChainIdRules: [
      v => !!v || "Token chain ID is required",
      v => (v && v.length === 64) || "Token chain ID must be 64 characters"
    ]
  }),

  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        // TODO
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  },
  mounted() {
    // TODO: should be done once at the startup of the whole application
    this.$store.dispatch("walletd/init");
    this.$store.dispatch("fatd/init");
    this.$store.dispatch("identity/init");
  }
};
</script>

<style scoped>
</style>
