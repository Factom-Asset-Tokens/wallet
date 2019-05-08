<template>
  <v-container grid-list-xl>
    <v-layout wrap>
      <v-flex md12 lg4 offset-lg4>
        <slot name="default">
          <v-btn class="button-padding" outline block color="secondary" depressed large :to="{ name: 'NewWallet' }">
            Create a new wallet
          </v-btn>
        </slot>
      </v-flex>

      <v-flex xs12>
        <v-layout wrap>
          <v-flex sm12 md6 lg4 offset-lg2>
            <v-btn
              class="button-padding"
              outline
              block
              color="primary"
              depressed
              large
              :to="{ name: 'RestoreWalletPhrase' }"
            >
              <v-icon left>settings_backup_restore</v-icon>Restore from recovery phrase
            </v-btn>
          </v-flex>
          <v-flex sm12 md6 lg4>
            <v-btn
              class="button-padding"
              outline
              block
              color="primary"
              depressed
              large
              :to="{ name: 'RestoreWalletBackup' }"
            >
              <v-icon left>fas fa-file-import</v-icon>Restore from backup file
            </v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.button-padding {
  height: 120px;
}
</style>
