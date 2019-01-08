<template>
  <v-container>
    <v-layout wrap fill-height>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <div class="headline">Token Supply</div>
          </v-card-title>
          <v-card-text>
            <v-layout wrap>
              <v-flex xs6 offset-xs3>
                <v-select :items="trackedTokens" label="Select token" v-model="tokenChainId" solo></v-select>
              </v-flex>
              <template v-if="tokenChainId">
                <v-flex xs12 v-if="canEmitCoinbaseTransaction">
                  <TokenSupplyDetails :chainId="token.chainId" :symbol="symbol"></TokenSupplyDetails>
                </v-flex>
                <v-flex xs12>
                  <v-alert :value="!canEmitCoinbaseTransaction" type="error" outline>
                    Issuing identity
                    <strong>{{token.issuer}}</strong> is not in your wallet.
                    <br>It needs to be imported if you want to make a coinbase transaction for this token.
                  </v-alert>
                </v-flex>
              </template>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 v-if="canEmitCoinbaseTransaction" my-4>
        <v-card>
          <v-card-title>
            <div class="headline">Coinbase recipients</div>
          </v-card-title>
          <v-card-text>
            <v-flex xs12>
              <JsonEditor
                ref="jsonEditor"
                v-model="recipients"
                :options="{mode: 'code', modes: ['code', 'tree'], enableSort: false, enableTransform: false, schema: recipientsSchema}"
                @onChange="onJsonChange"
              ></JsonEditor>
            </v-flex>
            <v-flex xs12 my-4>
              <v-alert :value="error" type="error" outline>{{error}}</v-alert>
            </v-flex>

            <v-flex xs12 text-xs-center my-4>
              <v-btn large :disabled="error !== ''" @click="send" color="primary">send coinbase transaction
                <v-icon right>send</v-icon>
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenSupplyDetails from "@/components/TokenSupplyDetails";
import JsonEditor from "@/components/JsonEditor";
import recipientsSchema from "@/json-schemas/coinbase-recipients.json";
import { isValidFctPublicAddress } from "factom";
import Ajv from "ajv";
const ajv = new Ajv();
const validateRecipientsJson = ajv.compile(recipientsSchema);

export default {
  components: { JsonEditor, TokenSupplyDetails },
  data() {
    return {
      recipientsSchema,
      tokenChainId: "",
      error: "",
      recipients: {
        FA24PAtyZWWVAPm95ZCVpwyY6RYHeCMTiZt2v4VQAY8aBXMUZyeF: 1
      },
      remainingSupply: -1
    };
  },
  computed: {
    token() {
      return this.$store.state.tokens.tracked[this.tokenChainId];
    },
    symbol() {
      return this.token ? this.token.issuance.symbol : undefined;
    },
    trackedTokens() {
      return Object.values(this.$store.state.tokens.tracked)
        .filter(t => t.issuance)
        .map(t => ({ value: t.chainId, text: t.tokenId }));
    },
    canEmitCoinbaseTransaction() {
      const identities = new Set(
        Object.keys(this.$store.state.identity.identities)
      );
      return this.tokenChainId && identities.has(this.token.issuer);
    }
  },
  methods: {
    onJsonChange() {
      this.error = "";
      this.validate();
    },
    send() {
      if (this.validate()) {
        console.log("SEND", this.$refs.jsonEditor.get());
      }
    },
    validate() {
      const text = this.$refs.jsonEditor.getText();
      let json;
      try {
        json = JSON.parse(text);
        // eslint-disable-next-line
      } catch (e) {
        this.error = "The JSON is not well formed.";
        return;
      }

      if (validateRecipientsJson(json)) {
        let totalAmount = 0;
        for (const [address, amount] of Object.entries(json)) {
          if (isValidFctPublicAddress(address)) {
            totalAmount += amount;
          } else {
            this.error = `${address} is not a valid public FCT address.`;
            return false;
          }
        }

        if (
          this.remainingSupply === -1 ||
          totalAmount <= this.remainingSupply
        ) {
          return true;
        } else {
          this.error = `Total coinbase transaction amount (${totalAmount.toLocaleString()} ${
            this.symbol
          }) is above remaining supply (${this.remainingSupply.toLocaleString()} ${
            this.symbol
          }).`;
          return false;
        }
      } else {
        this.error = "JSON content doesn't respect the expected format.";
      }
    }
  },
  watch: {
    async tokenChainId() {
      const cli = this.$store.getters["fatd/cli"];
      const { burned, circulating, supply } = await cli
        .getTokenCLI(this.tokenChainId)
        .getStats();

      if (supply === -1) {
        this.remainingSupply = -1;
      } else {
        this.remainingSupply = supply - circulating - burned;
      }
    }
  }
};
</script>

<style scoped>
</style>
