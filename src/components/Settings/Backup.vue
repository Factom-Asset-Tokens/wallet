<template>
  <v-sheet elevation="1">
    <v-container>
      <v-layout wrap>
        <v-flex xs12 mt-2 text-xs-center>
          <v-btn color="primary" large class="subheading" :loading="loadingSeed" @click="showSeed">
            <v-icon left>fa-seedling</v-icon>show recovery phrase
          </v-btn>
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn color="secondary" class="font-italic subheading text-none" flat @click="toggleSeedInfo"
            >Wait, what is a recovery phrase?</v-btn
          >
          <v-slide-y-transition>
            <v-sheet id="seedInfo" v-show="showSeedInfo" elevation="10">
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
                      wallet use the "save backup file" option.
                    </p>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-sheet>
          </v-slide-y-transition>
        </v-flex>
        <v-flex xs12 mt-4 text-xs-center>
          <v-btn color="primary" large class="subheading" @click="saveBackupFile">
            <v-icon left>far fa-save</v-icon>save backup file
          </v-btn>
        </v-flex>
        <v-flex xs12 text-xs-center>
          <v-btn color="secondary" class="font-italic subheading text-none" flat @click="toggleBackupFileInfo"
            >Wait, what is a backup file?</v-btn
          >
          <v-slide-y-transition>
            <v-sheet id="backupFileInfo" v-show="showBackupFileInfo" elevation="10">
              <v-container text-xs-left>
                <v-layout wrap>
                  <v-flex xs12 class="subheading">
                    <p>
                      A backup file is a snapshot of your wallet containing everything needed to fully restore the
                      wallet to its current state. It contains all the access keys to your funds and identities this is
                      why it is critically important that this backup file is kept secret and safe. Any malicious actor
                      gaining access to it would be able to steal your funds and identities.
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
    <ShowSeedDialog ref="showSeedDialog"></ShowSeedDialog>
  </v-sheet>
</template>

<script>
import ShowSeedDialog from './Backup/ShowSeedDialog.vue';
const { dialog } = require('electron').remote;
const { writeFile } = require('fs');

export default {
  name: 'Backup',
  components: { ShowSeedDialog },
  data: function() {
    return {
      showSeedInfo: false,
      showBackupFileInfo: false,
      loadingSeed: false
    };
  },
  methods: {
    async saveBackupFile() {
      const store = this.$store;

      try {
        const backup = await store.dispatch('backup');
        const data = JSON.stringify(backup, null, 4);

        dialog.showSaveDialog({ defaultPath: 'fat-wallet.backup.json' }, this.writeBackupFile.bind(null, data));
      } catch (e) {
        store.commit('snackError', e.message);
      }
    },
    async writeBackupFile(data, filename) {
      const store = this.$store;
      if (filename) {
        writeFile(filename, data, err => {
          if (err) {
            store.commit('snackError', err.message);
          } else {
            store.commit('snackSuccess', `File saved at ${filename}`);
          }
        });
      }
    },
    async showSeed() {
      this.loadingSeed = true;
      try {
        const seed = this.$store.state.keystore.store.getMnemonic().split(' ');
        this.$refs.showSeedDialog.show(seed);
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingSeed = false;
      }
    },
    toggleSeedInfo() {
      this.showSeedInfo = !this.showSeedInfo;
      if (this.showSeedInfo) {
        const vuetify = this.$vuetify;
        this.$nextTick(() => vuetify.goTo('#seedInfo'));
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
