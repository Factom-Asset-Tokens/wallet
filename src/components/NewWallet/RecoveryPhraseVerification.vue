<template>
  <v-form lazy-validation v-model="valid" ref="form" @submit.prevent="verify">
    <v-card>
      <v-card-title primary-title class="secondary--text display-1">
        <v-flex text-xs-center>Recovery phrase verification</v-flex>
      </v-card-title>
      <v-card-text>
        <v-layout wrap mb-3>
          <v-flex xs12 my-3>
            <blockquote class="blockquote">
              Re-enter your recovery phrase to verify that you correctly copied it.
            </blockquote>
          </v-flex>
          <v-container grid-list-xl>
            <v-layout wrap>
              <v-flex v-for="index in seed.length" :key="index" xs6 sm3>
                <v-text-field box validate-on-blur :rules="validateWord(index)" :prefix="index + '.'"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click="$emit('back')">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit" :disabled="!valid">Verify</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
export default {
  name: 'RecoveryPhraseVerification',
  props: ['seed'],
  data() {
    return {
      valid: true,
      words: []
    };
  },
  methods: {
    validateWord(index) {
      return [
        v => {
          return (v && v.trim().toLowerCase() === this.seed[index - 1]) || 'Wrong word';
        }
      ];
    },
    verify() {
      if (this.$refs.form.validate()) {
        this.$emit('next');
      }
    }
  },
  watch: {
    seed() {
      this.words = Array(this.seed.length).fill('');
    }
  }
};
</script>

<style scoped></style>
