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
    async sendTransaction(tx) {
      try {
        this.sending = true;
        this.transactionSentMessage = '';
        this.errorMessage = '';

        const txId = await this.broadcastTransaction(tx);

        this.transactionSentMessage = `<div>Transaction successfully sent. Transaction ID: ${txId}<div><div class="font-weight-black">Note it can take a few seconds for your balance to be updated</div>`;
        this.$refs.form.reset();
      } catch (e) {
        this.errorMessage = e.message;
      } finally {
        this.sending = false;
      }
    },
    async broadcastTransaction(tx) {
      const ledgerMode = this.$store.state.ledgerMode;

      try {
        const { entryhash } = await this.tokenCli.sendTransaction(tx);
        return entryhash;
      } catch (e) {
        const code = tryParseApiErrorCode(e);
        if (code === -32806) {
          let payingEcAddress;
          if (ledgerMode) {
            payingEcAddress = await this.$store.dispatch('address/getPayingEcAddress');
          } else {
            payingEcAddress = await this.$store.dispatch('address/getPayingEcSecretKey');
          }

          if (!payingEcAddress) {
            throw new Error('No EC available to pay for the transaction.');
          }

          const factomd = this.$store.getters['factomd/cli'];
          const entry = Entry.builder(tx.getEntry()).build();
          const options = {};

          if (ledgerMode) {
            options.sign = (entryDataToSign, ecPublicAddress) => {
              this.showLedgerSignEntryDialog();
              return this.$store.dispatch('ledger/signEntry', { entryDataToSign, ecPublicAddress });
            };
          }

          const { entryHash } = await factomd.add(entry, payingEcAddress, options);

          return entryHash;
        } else {
          throw e;
        }
      } finally {
        if (ledgerMode) {
          this.closeLedgerSignEntryDialog();
        }
      }
    }
  }
};
