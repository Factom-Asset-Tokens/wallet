import { tryParseApiErrorCode } from '../components/common';
import { Entry } from 'factom';

export default {
  data() {
    return {
      sending: false,
      transactionSentMessage: ''
    };
  },
  methods: {
    async sendTransaction() {
      try {
        this.sending = true;
        this.transactionSentMessage = '';
        this.errorMessage = '';

        const tx = await this.buildTransaction();
        const txId = await this.broadcastTransaction(tx);

        this.transactionSentMessage = `Transaction successfully sent. Transaction ID: ${txId}`;
        this.$refs.form.reset();
      } catch (e) {
        this.errorMessage = e.message;
        console.error(e);
      } finally {
        this.sending = false;
      }
    },
    async broadcastTransaction(tx) {
      try {
        const { entryhash } = await this.tokenCli.sendTransaction(tx);
        return entryhash;
      } catch (e) {
        const code = tryParseApiErrorCode(e);
        if (code === -32806) {
          const payingEcAddress = await this.$store.dispatch('address/getPayingEcAddress');

          if (!payingEcAddress) {
            throw new Error('No Entry Credit available to pay for the transaction.');
          }

          const factomd = this.$store.getters['factomd/cli'];
          const entry = Entry.builder(tx.getEntry()).build();

          const { entryHash } = await factomd.add(entry, payingEcAddress, {
            commitTimeout: 10
          });

          return entryHash;
        } else {
          throw e;
        }
      }
    }
  }
};
