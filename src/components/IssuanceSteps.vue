<template>
  <v-stepper v-model="step">
    <v-stepper-header>
      <v-stepper-step :complete="step > 1" step="1">Name</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 2" step="2">Issuer</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 3" step="3">Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4">Summary</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1"></v-stepper-content>

      <v-stepper-content step="2"></v-stepper-content>

      <v-stepper-content step="3"></v-stepper-content>

      <v-stepper-content step="4"></v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  data: () => ({
      step: 1
  }),

  methods: {},
  mounted() {}
};
</script>

<style scoped>
</style>
