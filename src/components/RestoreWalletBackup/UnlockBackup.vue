<template>
  <v-container>
    <v-form @submit.prevent="restore">
      <v-card>
        <v-card-title primary-title class="secondary--text display-1">
          <v-flex text-xs-center>Restore Backup File</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout wrap mb-3>
            <v-flex xs12 my-5>
              <blockquote class="blockquote">Enter the password securing the backup file.</blockquote>
            </v-flex>
            <v-flex xs12 sm8 offset-sm2 text-xs-center>
              <v-text-field
                v-model="password"
                :append-icon="displayPassword ? 'visibility_off' : 'visibility'"
                :type="displayPassword ? 'text' : 'password'"
                @click:append="displayPassword = !displayPassword"
                label="Backup Password"
                :error-messages="errorMessages"
                @input="errorMessages = []"
                autofocus
                box
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-btn flat @click="back">Back</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Restore</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script>
import BackupCypher from '@/lib/BackupCypher';

const BACKUP_CYPHER = new BackupCypher();

export default {
  props: ['encryptedBackup'],
  data() {
    return {
      errorMessages: [],
      displayPassword: false,
      password: ''
    };
  },
  methods: {
    back() {
      this.$router.replace({ name: 'Start' });
    },
    restore() {
      try {
        const backup = BACKUP_CYPHER.decypherBackup(this.encryptedBackup, this.password);
        this.$emit('restore', { backup, password: this.password });
      } catch (e) {
        if (e.message.includes('Decryption failed')) {
          this.errorMessages = ['Incorrect password'];
        } else {
          this.$store.commit('snackError', e.message);
        }
      }
    }
  }
};
</script>

<style scoped></style>
