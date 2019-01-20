<template>
  <v-stepper v-model="step">
    <v-stepper-header>
      <v-stepper-step :complete="step > 1" step="1">Type</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 2" step="2">Name and Issuer</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 3" step="3">Details</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4">Summary</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card>
          <v-form @submit.prevent="toStep2">
            <v-card-text>
              <TokenTypeStep v-model="type"></TokenTypeStep>
            </v-card-text>
            <v-card-actions>
              <v-btn type="submit" color="primary">Continue</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card>
          <v-form v-model="validFormStep2" ref="formStep2" @submit.prevent="toStep3" lazy-validation>
            <v-card-text>
              <IssuerAndNameStep @input="setIssuerAndName"></IssuerAndNameStep>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="step = 1" color="primary" flat outline>Back</v-btn>
              <v-btn :disabled="!validFormStep2" type="submit" color="primary">Continue</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card>
          <v-form v-model="validFormStep3" ref="formStep3" @submit.prevent="toStep4" lazy-validation>
            <v-card-text>
              <TokenDetailsStep :type="type" ref="tokenDetails"></TokenDetailsStep>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="step = 2" color="primary" flat outline>Back</v-btn>
              <v-btn :disabled="!validFormStep3" type="submit" color="primary">Continue</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-stepper-content>

      <v-stepper-content step="4">
        <v-card>
          <v-card-text>
            <TokenSummaryStep
              :render="step === 4"
              :tokenId="tokenId"
              :issuerId="issuerId"
              :type="type"
              :details="tokenDetails"
            ></TokenSummaryStep>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="step = 3" color="primary" flat outline>Back</v-btn>
            <v-btn @click="issue" color="primary">Issue token</v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import TokenTypeStep from "./TokenTypeStep";
import IssuerAndNameStep from "./IssuerAndNameStep";
import TokenDetailsStep from "./TokenDetailsStep";
import TokenSummaryStep from "./TokenSummaryStep";

export default {
  components: { TokenTypeStep, IssuerAndNameStep, TokenDetailsStep, TokenSummaryStep },
  data: () => ({
    step: 1,
    validFormStep2: true,
    validFormStep3: true,
    type: "fat0",
    tokenId: "",
    issuerId: "",
    tokenDetails: {}
  }),
  methods: {
    setIssuerAndName(o) {
      const { tokenId, issuerId } = o;
      this.tokenId = tokenId;
      this.issuerId = issuerId;
    },
    toStep2() {
      this.step = 2;
    },
    toStep3() {
      if (this.$refs.formStep2.validate()) {
        this.step = 3;
      }
    },
    toStep4() {
      if (this.$refs.formStep3.validate()) {
        this.tokenDetails = this.$refs.tokenDetails.getDetails();
        this.step = 4;
      }
    },
    issue() {
      // TODO
      console.log("issue");
    }
  }
};
</script>

<style scoped>
</style>
