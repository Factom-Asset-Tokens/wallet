<template>
  <v-form lazy-validation v-model="valid" ref="form" @submit.prevent="validate">
    <v-card>
      <v-card-title primary-title class="secondary--text display-1">
        <v-flex text-xs-center>Enter your recovery phrase</v-flex>
      </v-card-title>
      <v-card-text>
        <v-layout wrap mb-3>
          <v-flex xs12 text-xs-center class="subheading" mt-4 mb-5>
            <v-btn-toggle v-model="phraseLength" mandatory>
              <v-btn flat :value="12">
                12
              </v-btn>
              <v-btn flat :value="24">
                24
              </v-btn> </v-btn-toggle
            >-word recovery phrase
          </v-flex>
          <v-container grid-list-xl>
            <v-layout wrap>
              <v-flex v-for="index in phraseLength" :key="index" xs6 sm3>
                <v-text-field
                  v-model.trim="words[index - 1]"
                  box
                  :autofocus="index === 1"
                  validate-on-blur
                  :rules="wordRules"
                  :prefix="index + '.'"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-flex v-if="errorMessage" xs12 md8 offset-md2>
            <v-alert :value="true" type="error" outline>{{ errorMessage }}</v-alert>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click="$emit('back')">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit" :disabled="!valid">Validate</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
import * as bip39 from 'bip39';
const WORD_LIST = new Set(bip39.wordlists.english);

export default {
  name: 'InputRecoveryPhrase',
  data() {
    return {
      phraseLength: 12,
      valid: true,
      words: Array(24).fill(''),
      wordRules: [
        v => {
          return (v && WORD_LIST.has(v.trim().toLowerCase())) || 'Invalid word';
        }
      ],
      errorMessage: ''
    };
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        const seed = this.words
          .slice(0, this.phraseLength)
          .map(w => w.trim().toLowerCase())
          .join(' ');

        if (bip39.validateMnemonic(seed)) {
          this.$emit('update:seed', seed.split(' '));
          this.$emit('next');
        } else {
          this.errorMessage = 'Invalid recovery phrase';
        }
      }
    }
  },
  watch: {
    words() {
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped></style>
