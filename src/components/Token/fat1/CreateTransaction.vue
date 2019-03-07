<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 mt-5>
      <v-sheet class="white--text" color="primary" elevation="1">
        <div class="display-1 font-weight-bold">Send transaction</div>
      </v-sheet>
    </v-flex>
    <v-flex>
      <v-form v-model="valid" ref="form" @submit.prevent="confirmTransaction" lazy-validation>
        <v-container fluid>
          <v-layout wrap align-baseline>
            <v-flex xs12 mt-3>
              <div class="headline">Available Tokens</div>
            </v-flex>
            <v-flex xs12>
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
                {{id | displayIds}}
              </v-chip>
            </v-flex>
            <v-flex xs12 mt-4>
              <div class="headline">Tokens to send</div>
            </v-flex>
            <v-flex xs12>
              <div v-if="selectedTokens.length > 0">
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
                  {{id | displayIds}}
                </v-chip>
              </div>
              <div
                v-else
                class="font-italic subheading"
              >Start selecting tokens from the "Available Tokens" section.</div>
            </v-flex>
            <v-flex md9 mt-4>
              <v-text-field
                v-model="address"
                label="Recipient address"
                counter="52"
                :rules="addressRules"
                :disabled="burn"
                clearable
                required
                solo
              ></v-text-field>
            </v-flex>
            <v-flex md1 mt-4 text-xs-left>
              <v-icon title="Burn tokens" :color="fireColor" @click="clickBurn">fas fa-fire-alt</v-icon>
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

            <!-- Alerts transaction success/failure-->
            <v-flex v-if="errorMessage" xs12>
              <v-alert :value="true" type="error" outline dismissible>{{errorMessage}}</v-alert>
            </v-flex>
            <v-flex xs12>
              <v-alert
                :value="transactionSentMessage"
                type="success"
                outline
                dismissible
              >{{transactionSentMessage}}</v-alert>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-flex>

    <!-- Dialogs -->
    <SelectIdRangeDialog ref="rangeSelectDialog" @add="addToken"></SelectIdRangeDialog>
    <TokenDetailsDialog ref="detailsDialog" :tokenCli="tokenCli" :symbol="symbol"></TokenDetailsDialog>
    <ConfirmTransactionDialog
      ref="confirmTransactionDialog"
      :selectedTokens="selectedTokens"
      :address="address"
      :burn="burn"
      @confirmed="send"
    ></ConfirmTransactionDialog>
    <ConfirmBurnDialog ref="confirmBurnDialog" :selectedTokens="selectedTokens" @confirmed="send"></ConfirmBurnDialog>
  </v-layout>
</template>

<script>
import Promise from "bluebird";
import flatmap from "lodash.flatmap";
import groupBy from "lodash.groupby";
import { isValidPublicFctAddress } from "factom";
import { displayIds, idsSetDiff } from "./ids-utils.js";
import SelectIdRangeDialog from "./SelectIdRangeDialog";
import ConfirmTransactionDialog from "./ConfirmTransactionDialog";
import ConfirmBurnDialog from "./ConfirmBurnDialog";
import TokenDetailsDialog from "./TokenDetailsDialog";
import { TransactionBuilder } from "@fat-token/fat-js/1/Transaction";
import SendTransaction from "@/mixins/SendTransaction";

export default {
  props: ["symbol", "tokenCli", "balances"],
  mixins: [SendTransaction],
  components: {
    SelectIdRangeDialog,
    TokenDetailsDialog,
    ConfirmTransactionDialog,
    ConfirmBurnDialog
  },
  data() {
    return {
      address: "",
      burn: false,
      selectedTokens: [],
      valid: true,
      errorMessage: "",
      addressRules: [
        v =>
          this.burn ||
          isValidPublicFctAddress(v) ||
          "Invalid public FCT address"
      ]
    };
  },
  computed: {
    fireColor() {
      return this.burn ? "error" : "grey";
    },
    availableTokens() {
      const allTokens = flatmap(
        this.balances.filter(b => b.ids).map(b => b.ids)
      );
      return idsSetDiff(allTokens, this.selectedTokens);
    }
  },
  methods: {
    clickBurn() {
      this.burn = !this.burn;
      if (this.burn) {
        this.address = "Burning address";
      } else {
        this.address = "";
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
        if (this.burn) {
          this.$refs.confirmBurnDialog.show();
        } else {
          this.$refs.confirmTransactionDialog.show();
        }
      }
    },
    async buildTransaction() {
      const txBuilder = new TransactionBuilder(this.tokenCli.getTokenChainId());

      const idsWithOwner = await Promise.map(this.selectedTokens, id =>
        this.tokenCli.getNFToken(id.min).then(t => ({ id, owner: t.owner }))
      );

      const inputs = groupBy(idsWithOwner, e => e.owner);

      // Get inputs secret keys
      const walletd = this.$store.getters["walletd/cli"];
      const inputsSecrets = await Promise.map(
        Object.keys(inputs),
        async function(address) {
          const { secret } = await walletd.call("address", {
            address: address
          });
          const ids = inputs[address].map(i =>
            i.id.min === i.id.max ? i.id.min : i.id
          );
          return { secret, ids };
        }
      );

      for (const input of inputsSecrets) {
        txBuilder.input(input.secret, input.ids);
      }

      const outputAddress = this.burn
        ? "FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC"
        : this.address;

      txBuilder.output(
        outputAddress,
        this.selectedTokens.map(id => (id.min === id.max ? id.min : id))
      );

      return txBuilder.build();
    },
    async send() {
      await this.sendTransaction();
      if (this.transactionSentMessage) {
        this.burn = false;
        this.selectedTokens = [];
      }
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
</style>
