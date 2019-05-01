<template>
  <v-form @submit.prevent="$emit('next')">
    <v-card>
      <v-card-title primary-title class="secondary--text display-1">
        <v-flex text-xs-center>Important notice</v-flex>
      </v-card-title>
      <v-card-text>
        <v-layout wrap mb-3>
          <v-flex xs12 mt-2>
            <blockquote class="blockquote">
              <p>
                You are about to set up two critical pieces of information that will guarantee the safety of your new
                wallet (funds and identities). They must remain private and in your sole control at all time. Make sure
                no one is looking over your shoulder while setting up your wallet.
              </p>
            </blockquote>
          </v-flex>
          <v-flex xs12>
            <blockquote class="blockquote">
              <p>
                <span class="secondary--text">Wallet password</span>: that password will secure the access to your
                wallet. It is necessary to log into your wallet. If you forget your password there is no process to
                recover it.
              </p>
              <p>
                <span class="secondary--text">Recovery Phrase</span>: it is a 12 or 24-word phrase that allows to
                recover your addresses if something goes wrong (for instance if you lost access to your wallet). It is
                strongly recommended that you backup your Recovery Phrase offline and store it in a safe, timeproof
                place. Anyone with your Recovery Phrase could access or spend your funds.
              </p>
            </blockquote>
          </v-flex>
          <v-flex xs12>
            <blockquote class="blockquote">
              <p class="secondary--text font-weight-medium">
                Losing access to both your recovery phrase and your wallet password will result in the irremediable loss
                of your funds.
              </p>
            </blockquote>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-btn flat @click="$emit('back')">Back</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" type="submit">I understand my responsability</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script>
export default {
  name: 'Introduction'
};
</script>

<style scoped></style>
