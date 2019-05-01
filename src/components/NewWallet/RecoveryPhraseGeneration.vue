<template>
  <v-card>
    <v-card-title primary-title class="secondary--text display-1">
      <v-flex text-xs-center>Recovery phrase</v-flex>
    </v-card-title>
    <v-card-text>
      <v-layout wrap mb-3>
        <v-flex xs12 my-3>
          <blockquote class="blockquote">
            Copy you recovery phrase to a safe and secret location only you can access. It is highly suggested to have a
            copy in the physical world, for instance it could be written on paper and put in a bank safe.
          </blockquote>
        </v-flex>
        <v-flex xs12 text-xs-center class="subheading" mb-5>
          <v-btn-toggle v-model="seedStrength" mandatory>
            <v-btn flat value="128">
              12
            </v-btn>
            <v-btn flat value="256">
              24
            </v-btn> </v-btn-toggle
          >-word recovery phrase
        </v-flex>
        <v-container grid-list-xl>
          <v-layout wrap>
            <v-flex v-for="(word, index) in seed" :key="index" xs6 sm3>
              <v-chip class="title" outline color="secondary">{{ index + 1 }}. {{ word }}</v-chip>
            </v-flex>
          </v-layout>
        </v-container>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn flat @click="$emit('back')">Back</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="$emit('next')">I wrote down my recovery phrase</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { generateMnemonic } from 'bip39';

export default {
  name: 'RecoveryPhraseGeneration',
  data() {
    return {
      seed: [],
      seedStrength: '128'
    };
  },
  created() {
    this.generateMnemonic();
  },
  methods: {
    generateMnemonic() {
      this.seed = generateMnemonic(this.seedStrength).split(' ');
      this.$emit('update:seed', this.seed);
    }
  },
  watch: {
    seedStrength() {
      this.generateMnemonic();
    }
  }
};
</script>

<style scoped></style>
