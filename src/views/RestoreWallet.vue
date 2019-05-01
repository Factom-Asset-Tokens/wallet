<template>
  <v-container>
    <v-window v-model="step">
      <v-window-item :value="1">
        <RecoveryPhraseInput
          @next="step = 2"
          @back="$router.replace({ name: 'Start' })"
          @update:seed="seed = $event"
        ></RecoveryPhraseInput>
      </v-window-item>
      <v-window-item :value="2">
        <SetPassword @next="step = 3" @back="step = 1" @update:password="password = $event"></SetPassword>
      </v-window-item>
      <v-window-item :value="3">
        <Initialization :password="password" :seed="seed" :active="step === 3"></Initialization>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
import SetPassword from '@/components/NewWallet/SetPassword';
import RecoveryPhraseInput from '@/components/RestoreWallet/RecoveryPhraseInput';
import Initialization from '@/components/NewWallet/Initialization';

export default {
  name: 'RestoreWallet',
  components: { SetPassword, RecoveryPhraseInput, Initialization },
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
