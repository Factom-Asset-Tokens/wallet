<template>
  <v-sheet elevation="1">
    <v-container>
      <v-layout wrap>
        <v-flex xs12 mt-2 text-xs-center>
          <v-btn color="primary" large class="subheading" @click="showRecoveryPhraseDialog">
            <v-icon left>fa-seedling</v-icon>show recovery phrase
          </v-btn>
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn color="secondary" class="font-italic subheading text-none" flat @click="toggleRecoveryPhraseInfo"
            >Wait, what is a recovery phrase?</v-btn
          >
          <v-slide-y-transition>
            <v-sheet id="recoveryPhraseInfo" v-show="showRecoveryPhraseInfo" elevation="10">
              <v-container text-xs-left>
                <v-layout wrap>
                  <v-flex xs12 class="subheading">
                    <p class="font-weight-black">
                      The recovery phrase is a "master access key" made of 12 or 24 simple and rememberable words. From
                      this phrase it is possible to recover your wallet keys. This is why it is critically important to
                      keep a copy of that phrase secret and safe. Any malicious actor gaining access to it would be able
                      to steal your funds and identities.
                    </p>
                    <p>
                      Important note: some aspects of the wallet cannot be recovered solely from the recovery phrase:
                    </p>
                    <ul class="margin-bottom">
                      <li>
                        All Factoid and Entry Credit addresses manually imported (addresses not generated from within
                        the FAT wallet).
                      </li>
                      <li>
                        All the identity keys manually imported (i.e. identity keys not associated with an identity that
                        was generated from within the FAT wallet).
                      </li>
                      <li>Nicknames attached to your addresses.</li>
                      <li>List of your identities chain ids.</li>
                    </ul>
                    <p>
                      Point 1 and 2 are the most important to be aware of. If you are looking for a full backup of the
                      wallet use the "generate backup file" option.
                    </p>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-sheet>
          </v-slide-y-transition>
        </v-flex>
        <v-flex xs12 mt-4 text-xs-center>
          <v-btn color="primary" large class="subheading" @click="showGenerateBackupFileDialog">
            <v-icon left>far fa-save</v-icon>generate encrypted backup file
          </v-btn>
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn color="secondary" class="font-italic subheading text-none" flat @click="toggleBackupFileInfo"
            >Wait, what is an encrypted backup file?</v-btn
          >
          <v-slide-y-transition>
            <v-sheet id="backupFileInfo" v-show="showBackupFileInfo" elevation="10">
              <v-container text-xs-left>
                <v-layout wrap>
                  <v-flex xs12 class="subheading">
                    <p>
                      An encrypted backup file is a snapshot of your wallet containing everything needed to fully
                      restore the wallet to its current state and that is encrypted with your current wallet password.
                      It contains all the access keys to your funds and identities this is why it is important that this
                      backup file is kept secret and safe. You must remember your current wallet password to be able to
                      restore your wallet at a later time using this file.
                    </p>
                    <p>
                      It is a super-set of the recovery phrase and will include everything that is not covered by it.
                    </p>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-sheet>
          </v-slide-y-transition>
        </v-flex>
      </v-layout>
    </v-container>
    <ShowRecoveryPhraseDialog ref="showRecoveryPhraseDialog"></ShowRecoveryPhraseDialog>
    <GenerateBackupFileDialog ref="generateBackupFileDialog"></GenerateBackupFileDialog>
  </v-sheet>
</template>

<script>
import ShowRecoveryPhraseDialog from './Backup/ShowRecoveryPhraseDialog.vue';
import GenerateBackupFileDialog from './Backup/GenerateBackupFileDialog.vue';

export default {
  name: 'Backup',
  components: { ShowRecoveryPhraseDialog, GenerateBackupFileDialog },
  data: function() {
    return {
      showRecoveryPhraseInfo: false,
      showBackupFileInfo: false
    };
  },
  methods: {
    showRecoveryPhraseDialog() {
      this.$refs.showRecoveryPhraseDialog.show();
    },
    showGenerateBackupFileDialog() {
      this.$refs.generateBackupFileDialog.show();
    },
    toggleRecoveryPhraseInfo() {
      this.showRecoveryPhraseInfo = !this.showRecoveryPhraseInfo;
      if (this.showRecoveryPhraseInfo) {
        const vuetify = this.$vuetify;
        this.$nextTick(() => vuetify.goTo('#recoveryPhraseInfo'));
      }
    },
    toggleBackupFileInfo() {
      this.showBackupFileInfo = !this.showBackupFileInfo;
      if (this.showBackupFileInfo) {
        const vuetify = this.$vuetify;
        this.$nextTick(() => vuetify.goTo('#backupFileInfo'));
      }
    }
  }
};
</script>

<style scoped>
.margin-bottom {
  margin-bottom: 16px;
}
</style>
