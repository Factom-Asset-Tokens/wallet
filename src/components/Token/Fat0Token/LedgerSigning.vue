<script>
import LedgerSigning from '@/components/LedgerSigning.vue';

import TransactionBuilder from '@fat-token/fat-js/0/TransactionBuilder';

export default {
  extends: LedgerSigning,
  data() {
    return {
      nextInputIndex: 0,
      addressesToSign: []
    };
  },
  computed: {
    signatureCompleted() {
      return !this.active || this.signatures.length === this.addressesToSign.length;
    }
  },
  methods: {
    async signTransactionForNextInput() {
      const nextAddress = this.addressesToSign[this.nextInputIndex];
      const signature = await this.$store.dispatch('ledger/signFatTransactionForInput', {
        type: 0,
        unsignedTx: this.transaction,
        inputAddress: nextAddress
      });

      this.nextInputIndex++;
      return signature;
    },
    buildSignedTransaction() {
      const builder = new TransactionBuilder(this.transaction);
      for (const sig of this.signatures) {
        builder.pkSignature(sig.publicKey, Buffer.from(sig.signature, 'hex'));
      }
      return builder.build();
    }
  },
  watch: {
    transaction: {
      deep: true,
      handler() {
        this.addressesToSign = Object.keys(this.transaction.getInputs());
      }
    }
  }
};
</script>

<style></style>
