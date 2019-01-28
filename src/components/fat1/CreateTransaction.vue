<template>
  <v-layout wrap>
    <v-flex text-xs-center xs12 mt-4>
      <v-sheet class="white--text" color="primary" elevation="1">
        <h1>Send transaction</h1>
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
                :key="id.from || id"
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
                  :key="id.from || id"
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
              >Send
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-flex>

    <SelectIdRangeDialog ref="rangeSelectDialog" @add="addToken"></SelectIdRangeDialog>
    <TokenDetailsDialog ref="detailsDialog" :symbol="symbol"></TokenDetailsDialog>
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
import flatmap from "lodash.flatmap";
import { isValidFctPublicAddress } from "factom";
import { displayIds, availableTokens } from "./ids-utils.js";
import SelectIdRangeDialog from "./SelectIdRangeDialog";
import ConfirmTransactionDialog from "./ConfirmTransactionDialog";
import ConfirmBurnDialog from "./ConfirmBurnDialog";
import TokenDetailsDialog from "./TokenDetailsDialog";
import balances from "./mockup-balances.json";

export default {
  props: ["symbol", "tokenCli"],
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
      balances,
      valid: true,
      addressRules: [
        v =>
          this.burn ||
          isValidFctPublicAddress(v) ||
          "Invalid public FCT address"
      ]
    };
  },
  computed: {
    fireColor() {
      return this.burn ? "error" : "grey";
    },
    availableTokens() {
      const allTokens = flatmap(this.balances.map(b => b.ids));
      return availableTokens(allTokens, this.selectedTokens);
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
      if (id.from === id.to) {
        this.addToken(id);
      } else {
        this.$refs.rangeSelectDialog.show(id.from, id.to);
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
    send() {
      // TODO: send
      console.log("SEND");
      this.$refs.form.reset();
      this.burn = false;
      this.selectedTokens = [];
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
