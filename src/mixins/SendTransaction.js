import { tryParseApiErrorCode } from "../components/common";
import { Entry } from "factom";

export default {
    methods: {
        async sendTransaction(tx) {
            try {
                const { entryhash } = await this.tokenCli.sendTransaction(tx);
                return entryhash;
            } catch (e) {
                const code = tryParseApiErrorCode(e);
                if (code === -32806) {
                    const payingEcAddress = this.$store.getters["address/payingEcAddress"];

                    if (!payingEcAddress) {
                        throw new Error('No Entry Credit available to pay for the transaction.');
                    }

                    const factomd = this.$store.getters["factomd/cli"];
                    const entry = Entry.builder(tx.getEntry()).build();

                    const { entryHash } = await factomd.add(entry, payingEcAddress);

                    return entryHash;
                } else {
                    throw e;
                }
            }
        }
    }
};