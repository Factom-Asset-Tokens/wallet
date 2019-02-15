import Promise from "bluebird";
import { Transaction } from "factom";

export async function buildTransaction(store, balances, outputAddress, amount) {
    const ecRate = await store.getters['factomd/cli'].getEntryCreditRate();
    const outputAmount = outputAddress[0] === 'E' ? amount * ecRate : amount

    const tx = getFeeAdjustedTransaction(balances, outputAddress, outputAmount, ecRate);
    // Get inputs secret keys
    const walletd = store.getters["walletd/cli"];
    const inputsSecrets = await Promise.map(tx.inputs, async function (input) {
        const { secret } = await walletd.call("address", {
            address: input.address
        });
        return { secret, amount: input.amount };
    });

    // Build signed transaction with correct fees
    const signedTxBuilder = Transaction.builder().output(
        outputAddress,
        outputAmount
    );
    for (const input of inputsSecrets) {
        signedTxBuilder.input(input.secret, input.amount);
    }
    signedTxBuilder.build();

    return signedTxBuilder.build();
}


export function getFeeAdjustedTransaction(balances, outputAddress, outputAmount, ecRate) {
    const totalBalance = Object.values(balances).reduce((acc, val) => acc + val, 0);

    let inputsAmount = outputAmount;
    // Build initial TX without fee
    let inputs = computeInputs(balances, totalBalance, inputsAmount, outputAddress);
    const txBuilder = Transaction.builder().output(
        outputAddress,
        outputAmount
    );
    for (const input of inputs) {
        txBuilder.input(input.address, input.amount);
    }
    let tx = txBuilder.build();

    // Iterate until finding the right fee
    while (tx.feesPaid < tx.computeRequiredFees(ecRate, { rcdType: 1 })) {
        const fees = tx.computeRequiredFees(ecRate, { rcdType: 1 });

        inputsAmount += fees;
        inputs = computeInputs(balances, totalBalance, inputsAmount, outputAddress);

        const txBuilder = Transaction.builder().output(
            outputAddress,
            outputAmount
        );
        for (const input of inputs) {
            txBuilder.input(input.address, input.amount);
        }
        tx = txBuilder.build();
    }

    return tx;
}

function computeInputs(balances, totalBalance, amount, excludedAddress) {
    const availableBalance = totalBalance - (balances[excludedAddress] || 0);

    if (amount > availableBalance) {
        throw new Error("Not enough funds to make that transaction");
    }

    const inputs = [];
    let amountToCover = amount;

    // Greedy algorithm to select inputs
    const sortedBalances = Object.keys(balances).map(address => ({
        address,
        balance: balances[address]
    })).sort((a, b) => a.balance < b.balance);

    for (const b of sortedBalances) {
        if (b.address !== excludedAddress && b.balance > 0) {
            if (amountToCover - b.balance > 0) {
                inputs.push({ address: b.address, amount: b.balance });
                amountToCover -= b.balance;
            } else {
                inputs.push({ address: b.address, amount: amountToCover });
                break;
            }
        }
    }

    return inputs;
}
