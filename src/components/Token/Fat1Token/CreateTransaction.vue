<template>
  <div>
    <v-layout wrap>
      <v-flex>
        <v-sheet class="elevation-1 vsheet-bottom-margin">
          <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
            <v-container fluid id="transaction">
              <v-layout wrap align-baseline>
                <v-flex xs12>
                  <div class="headline">Available Tokens</div>
                </v-flex>
                <v-flex xs12 v-if="availableTokens.length > 0">
                  <v-chip
                    v-for="id in availableTokens"
                    :key="id.min"
                    outline
                    color="secondary"
                    class="font-weight-bold subheading"
                    @click="selectToken(id)"
                  >
                    <v-avatar class="secondary grey-text" @click.stop="showTokenDetails(id)">
                      <v-icon>info_outline</v-icon>
                    </v-avatar>
                    {{ id | displayIds }}
                  </v-chip>
                </v-flex>
                <v-flex xs12 v-else class="font-italic subheading primary--text">
                  You do not have any token yet!
                </v-flex>
                <v-flex xs12 mt-4>
                  <div class="headline">Tokens to send</div>
                </v-flex>
                <v-flex xs12 v-if="selectedTokens.length > 0">
                  <v-chip
                    v-for="id in selectedTokens"
                    :key="id.min"
                    outline
                    color="secondary"
                    class="font-weight-bold subheading"
                    close
                    @input="unselectToken(id)"
                  >
                    <v-avatar class="secondary grey-text" @click.stop="showTokenDetails(id)">
                      <v-icon>info_outline</v-icon>
                    </v-avatar>
                    {{ id | displayIds }}
                  </v-chip>
                </v-flex>
                <v-flex xs12 v-else class="font-italic subheading primary--text">
                  Start selecting tokens from the "Available Tokens" section.
                </v-flex>
                <v-flex md8 mt-4>
                  <v-text-field
                    v-model="address"
                    label="Recipient address"
                    counter="52"
                    :rules="addressRules"
                    :disabled="burn"
                    clearable
                    required
                    single-line
                    box
                  ></v-text-field>
                </v-flex>
                <v-flex md2 mt-4 text-xs-left>
                  <v-btn icon>
                    <v-icon title="Burn tokens" :color="burnIconColor" @click="toggleBurnAddress">
                      fas fa-fire-alt
                    </v-icon>
                  </v-btn>
                  <v-btn icon>
                    <v-icon title="Attach metadata" :color="metadataIconColor" @click="attachMetadata">more</v-icon>
                  </v-btn>
                </v-flex>

                <v-flex md2 text-xs-right mt-4>
                  <v-btn
                    color="primary"
                    large
                    :disabled="!valid || selectedTokens.length === 0"
                    type="submit"
                    :loading="sending"
                    >Send
                    <v-icon right>send</v-icon>
                  </v-btn>
                </v-flex>

                <!-- Extra validation rules errors (not dismissable) -->
                <v-flex xs12>
                  <v-alert v-if="sendClicked" :value="!validTransaction" color="error" icon="warning" outline>
                    {{ transactionError }}
                  </v-alert>
                </v-flex>

                <!-- Alerts transaction success/failure-->
                <v-flex v-if="errorMessage" xs12>
                  <v-alert :value="true" type="error" outline dismissible>{{ errorMessage }}</v-alert>
                </v-flex>
                <v-flex xs12>
                  <v-alert :value="transactionSentMessage" type="success" outline dismissible>
                    {{ transactionSentMessage }}
                  </v-alert>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-sheet>
      </v-flex>

      <!-- Dialogs -->
      <SelectIdRangeDialog ref="rangeSelectDialog" @add="addToken"></SelectIdRangeDialog>
      <AttachMetadataDialog ref="attachMetadataDialog" @update:metadata="metadata = $event"> </AttachMetadataDialog>
      <NfTokenDetailsDialog ref="detailsDialog" :tokenCli="tokenCli" :symbol="symbol"></NfTokenDetailsDialog>
      <ConfirmTransactionDialog
        ref="confirmTransactionDialog"
        :selectedTokens="selectedTokens"
        :address="address"
        :metadata="metadata"
        @confirmed="send"
      ></ConfirmTransactionDialog>
      <ConfirmBurnDialog
        ref="confirmBurnDialog"
        :selectedTokens="selectedTokens"
        :metadata="metadata"
        @confirmed="send"
      ></ConfirmBurnDialog>
    </v-layout>
    <AddressBook type="fct" @address="pickAddressFromAddressBook"></AddressBook>
  </div>
</template>

<script>
import Promise from 'bluebird';
import flatmap from 'lodash.flatmap';
import groupBy from 'lodash.groupby';
import { isValidPublicFctAddress } from 'factom';
import { TransactionBuilder } from '@fat-token/fat-js/1/Transaction';
import { displayIds, idsSetDiff, matchOwners } from '@/components/Token/Fat1Token/nf-token-ids.js';
import SendFatTransaction from '@/mixins/SendFatTransaction';
// Components
import SelectIdRangeDialog from './CreateTransaction/SelectIdRangeDialog';
import ConfirmTransactionDialog from './CreateTransaction/ConfirmTransactionDialog';
import ConfirmBurnDialog from './CreateTransaction/ConfirmBurnDialog';
import NfTokenDetailsDialog from '@/components/Token/Fat1Token/NfTokenDetailsDialog';
import AddressBook from '@/components/AddressBook';
import AttachMetadataDialog from '@/components/Token/AttachMetadataDialog';

export default {
  props: ['symbol', 'tokenCli', 'balances'],
  mixins: [SendFatTransaction],
  components: {
    SelectIdRangeDialog,
    NfTokenDetailsDialog,
    ConfirmTransactionDialog,
    ConfirmBurnDialog,
    AddressBook,
    AttachMetadataDialog
  },
  data() {
    return {
      address: '',
      burn: false,
      selectedTokens: [],
      metadata: '',
      valid: true,
      errorMessage: '',
      sendClicked: false,
      validTransaction: true,
      addressRules: [v => this.burn || isValidPublicFctAddress(v) || 'Invalid public FCT address']
    };
  },
  computed: {
    burnIconColor() {
      return this.burn ? 'secondary' : 'grey';
    },
    metadataIconColor() {
      return this.metadata ? 'secondary' : 'grey';
    },
    availableTokens() {
      const allTokens = flatmap(this.balances.filter(b => b.ids).map(b => b.ids));
      return idsSetDiff(allTokens, this.selectedTokens);
    },
    validTransactionProperties() {
      return [this.selectedTokens, this.address];
    }
  },
  methods: {
    pickAddressFromAddressBook(address) {
      this.address = address;
      const vuetify = this.$vuetify;
      this.$nextTick(() => vuetify.goTo('#transaction'));
    },
    toggleBurnAddress() {
      this.burn = !this.burn;
      if (this.burn) {
        this.address = '🔥🔥 Burn Address 🔥🔥';
      } else {
        this.address = '';
      }
    },
    selectToken(id) {
      if (id.min === id.max) {
        this.addToken(id);
      } else {
        this.$refs.rangeSelectDialog.show(id.min, id.max);
      }
    },
    addToken(id) {
      this.selectedTokens.push(id);
    },
    unselectToken(id) {
      this.selectedTokens = this.selectedTokens.filter(e => e !== id);
    },
    showTokenDetails(id) {
      this.$refs.detailsDialog.show(id);
    },
    confirmTransaction() {
      if (this.$refs.form.validate()) {
        this.sendClicked = true;
        // Additional validation rules check
        if (this.validTransaction) {
          this.sendClicked = false;
          if (this.burn) {
            this.$refs.confirmBurnDialog.show();
          } else {
            this.$refs.confirmTransactionDialog.show();
          }
        }
      }
    },
    async buildTransaction() {
      const txBuilder = new TransactionBuilder(this.tokenCli.getTokenChainId());

      const idsWithOwner = matchOwners(this.balances, this.selectedTokens);

      // Consolidate inputs by owner (address)
      const inputs = groupBy(idsWithOwner, e => e.owner);

      // Get inputs with secret keys
      const keystore = this.$store.state.keystore.store;
      const inputsSecrets = await Promise.map(Object.keys(inputs), async function(address) {
        const secret = keystore.getSecretKey(address);
        const ids = inputs[address].map(i => (i.id.min === i.id.max ? i.id.min : i.id));
        return { secret, ids };
      });

      for (const input of inputsSecrets) {
        txBuilder.input(input.secret, input.ids);
      }

      const outputAddress = this.burn ? 'FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC' : this.address;

      txBuilder.output(outputAddress, this.selectedTokens.map(id => (id.min === id.max ? id.min : id)));

      if (this.metadata) {
        txBuilder.metadata(this.metadata);
      }

      return txBuilder.build();
    },
    async send() {
      await this.sendTransaction();
      if (this.transactionSentMessage) {
        this.burn = false;
        this.selectedTokens = [];
        this.metadata = '';
      }
    },
    attachMetadata() {
      this.$refs.attachMetadataDialog.show(this.metadata);
    }
  },
  watch: {
    validTransactionProperties() {
      // Validate that the output address is not part of the input addresses
      const matchedOwners = matchOwners(this.balances, this.selectedTokens);
      const inputAddresses = new Set(matchedOwners.map(o => o.owner));
      if (inputAddresses.has(this.address)) {
        this.validTransaction = false;
        this.transactionError =
          'Some of the tokens selected for sending are already owned by the recipient address, you must remove them.';
        return;
      }

      this.validTransaction = true;
      this.transactionError = '';
    }
  },
  filters: {
    displayIds
  }
};
</script>

<style scoped>
.grey-text {
  color: #424242;
}
.vsheet-bottom-margin {
  margin-bottom: 24px;
}
</style>
