<script>
import LedgerSigning from '@/components/LedgerSigning.vue';

import { Transaction } from 'factom';

export default {
  extends: LedgerSigning,
  data() {
    return {};
  },
  computed: {
    signatureCompleted() {
      return !this.active || this.signatures.length === this.transaction.inputs.length;
    }
  },
  methods: {
    async signTransactionForNextInput() {
      const signature = await this.$store.dispatch('ledger/signTransactionForInput', {
        unsignedTX: this.transaction,
        inputIndex: this.signatures.length
      });
      return signature;
    },
    buildSignedTransaction() {
      const builder = Transaction.builder(this.transaction);
      for (const sig of this.signatures) {
        builder.rcdSignature(sig.rcd, sig.signature);
      }
      return builder.build();
    }
  }
};
</script>

<style></style>
