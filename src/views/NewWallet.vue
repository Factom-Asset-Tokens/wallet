<template>
  <v-container>
    <v-window v-model="step">
      <v-window-item :value="1">
        <Introduction @next="step = 2"></Introduction>
      </v-window-item>
      <v-window-item :value="2">
        <SetPassword @next="step = 3" @back="step = 1" :password.sync="password"></SetPassword>
      </v-window-item>
      <v-window-item :value="3">
        <RecoveryPhraseGeneration @next="step = 4" @back="step = 2" :seed.sync="seed"></RecoveryPhraseGeneration>
      </v-window-item>
      <v-window-item :value="4">
        <RecoveryPhraseVerification @next="step = 5" @back="step = 3" :seed="seed"></RecoveryPhraseVerification>
      </v-window-item>
      <v-window-item :value="5">
        <Initialization :password="password" :seed="seed" :active="step === 5"></Initialization>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
import Introduction from '@/components/NewWallet/Introduction';
import SetPassword from '@/components/NewWallet/SetPassword';
import RecoveryPhraseGeneration from '@/components/NewWallet/RecoveryPhraseGeneration';
import RecoveryPhraseVerification from '@/components/NewWallet/RecoveryPhraseVerification';
import Initialization from '@/components/NewWallet/Initialization';

export default {
  name: 'NewWallet',
  components: { Introduction, SetPassword, RecoveryPhraseGeneration, RecoveryPhraseVerification, Initialization },
  data() {
    return {
      step: 1,
      seed: [],
      password: ''
    };
  }
};
</script>

<style scoped></style>
