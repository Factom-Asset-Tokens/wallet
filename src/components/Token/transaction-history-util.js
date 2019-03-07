
import flatmap from "lodash.flatmap";

export function buildTransactionHistory(transactions, addresses) {
    const addressSet = new Set(addresses);

    return flatmap(
        transactions.map(tx => buildTransactionMovements(tx, addressSet))
    );
}

function buildTransactionMovements(tx, addressSet) {
    const result = [];
    
    for (const address in tx.getOutputs()) {
        if (addressSet.has(address)) {
            result.push(buildTransactionMovement({ tx, address, sign: '+', amount: tx.getOutputs()[address] }));
        }
    }
    for (const address in tx.getInputs()) {
        if (addressSet.has(address)) {
            result.push(buildTransactionMovement({ tx, address, sign: '-', amount: tx.getInputs()[address] }));
        }
    }


    return result;
}

function buildTransactionMovement({ tx, address, sign, amount }) {
    return {
        id: tx.getEntryhash(),
        address,
        sign,
        amount: Array.isArray(amount) ? computeTotalBalanceOfNfTokens(amount) : amount,
        timestamp: tx.getTimestamp()
    }
}

function computeTotalBalanceOfNfTokens(tokens) {
    return tokens.reduce(function (acc, token) {
        switch (typeof token) {
            case "number":
                return acc + 1;
            case "object":
                return acc + token.max - token.min + 1;
            default:
                throw new Error('Unsupported token', token);
        }
    }, 0);
}