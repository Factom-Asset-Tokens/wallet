<template>
  <v-container>
    <v-window v-model="step">
      <v-window-item :value="1">
        <UnlockBackup :encryptedBackup="encryptedBackup" @restore="restore"></UnlockBackup>
      </v-window-item>
      <v-window-item :value="2">
        <Initialization :password="password" :backup="backup" :active="step === 2"></Initialization>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
const { dialog } = require('electron').remote;
const { readFile } = require('fs');
import UnlockBackup from '@/components/RestoreWalletBackup/UnlockBackup';
import Initialization from '@/components/NewWallet/Initialization';

export default {
  components: { UnlockBackup, Initialization },
  data() {
    return {
      step: 1,
      encryptedBackup: {},
      backup: {},
      password: ''
    };
  },
  mounted() {
    dialog.showOpenDialog(
      {
        title: 'Open backup file',
        filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile']
      },
      this.openBackupFile.bind(this)
    );
  },
  methods: {
    back() {
      this.$router.replace({ name: 'Start' });
    },
    openBackupFile(filePaths) {
      if (filePaths && filePaths.length > 0) {
        this.validateBackupFile(filePaths[0], (err, data) => {
          if (err) {
            this.$store.commit('snackError', err.message);
            this.back();
            return;
          }
          this.encryptedBackup = data;
        });
      } else {
        this.back();
      }
    },
    validateBackupFile(filePath, callback) {
      readFile(filePath, (err, data) => {
        if (err) {
          return callback(err);
        }
        try {
          const backup = JSON.parse(data);
          if (typeof backup.nonce !== 'string' || typeof backup.backup !== 'string') {
            return callback(new Error('Invalid backup file format'));
          }

          return callback(null, backup);
        } catch (e) {
          return callback(new Error('Invalid backup file format'));
        }
      });
    },
    restore({ backup, password }) {
      this.backup = backup;
      this.password = password;
      this.step = 2;
    }
  }
};
</script>

<style scoped></style>
