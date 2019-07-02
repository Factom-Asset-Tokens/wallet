import Big from 'bignumber.js';
import { Transaction } from 'factom';

const FACTOSHI_MULTIPLIER = new Big(100000000);
const DUMMY_IO = { address: 'FA3syRxpYEvFFvoN4ZfNRJVQdumLpTK4CMmMUFmKGeqyTNgsg4uH', amount: new Big(0) };

/**
 * Given a single output address and amount, build a transaction by finding the necessary inputs
 */
export async function buildSingleOutputTransaction(store, totalBalance, balances, outputAddress, amount) {
  const ecRate = await store.getters['factomd/cli'].getEntryCreditRate();
  const outputAmount = outputAddress[0] === 'E' ? amount.times(ecRate) : amount;

  const tx = getFeeAdjustedTransaction(totalBalance, balances, outputAddress, outputAmount, ecRate);
  // Get inputs secret keys
  const keystore = store.state.keystore.store;
  const inputsSecrets = tx.inputs.map(input => ({
    secret: keystore.getSecretKey(input.address),
    amount: input.amount
  }));

  // Build signed transaction with correct fees
  const signedTxBuilder = Transaction.builder().output(outputAddress, toInt(outputAmount));
  for (const input of inputsSecrets) {
    signedTxBuilder.input(input.secret, input.amount);
  }
  signedTxBuilder.build();

  return signedTxBuilder.build();
}

/**
 * Given a single output address and amount, build a transaction by finding the necessary inputs and fees
 */
export function getFeeAdjustedTransaction(totalBalance, balances, outputAddress, outputAmount, ecRate) {
  let inputsAmount = outputAmount;
  // Build initial TX without fee
  let inputs = computeInputs(balances, totalBalance, inputsAmount, outputAddress);
  const txBuilder = Transaction.builder().output(outputAddress, toInt(outputAmount));
  for (const input of inputs) {
    txBuilder.input(input.address, toInt(input.amount));
  }
  let tx = txBuilder.build();

  // Iterate until finding the right fee
  while (tx.feesPaid < tx.computeRequiredFees(ecRate, { rcdType: 1 })) {
    const fees = tx.computeRequiredFees(ecRate, { rcdType: 1 });

    inputsAmount = inputsAmount.plus(fees);
    inputs = computeInputs(balances, totalBalance, inputsAmount, outputAddress);

    const txBuilder = Transaction.builder().output(outputAddress, toInt(outputAmount));
    for (const input of inputs) {
      txBuilder.input(input.address, toInt(input.amount));
    }
    tx = txBuilder.build();
  }

  return tx;
}

function computeInputs(balances, totalBalance, amount, excludedAddress) {
  const availableBalance = totalBalance.minus(balances[excludedAddress] || 0);

  if (amount.gt(availableBalance)) {
    throw new Error('Not enough funds to make that transaction');
  }

  const inputs = [];
  let amountToCover = amount;

  // Greedy algorithm to select inputs
  const sortedBalances = Object.keys(balances)
    .map(address => ({
      address,
      balance: balances[address]
    }))
    .sort((a, b) => a.balance.lt(b.balance));

  for (const b of sortedBalances) {
    if (b.address !== excludedAddress && b.balance.gt(0)) {
      if (amountToCover.minus(b.balance).gt(0)) {
        inputs.push({ address: b.address, amount: b.balance });
        amountToCover = amountToCover.minus(b.balance);
      } else {
        inputs.push({ address: b.address, amount: amountToCover });
        break;
      }
    }
  }

  return inputs;
}

export function getFeeAdjustedSisoTransaction({ inputAddress, outputAddress, amount, ecRate, keystore }) {
  const input = { address: inputAddress, amount };
  const output = { address: outputAddress, amount };

  const fee = computeRequiredFees([input], [output], ecRate).div(FACTOSHI_MULTIPLIER);
  const inputWithFees = { address: inputAddress, amount: fee.plus(amount) };

  return buildTransaction([inputWithFees], [output], keystore);
}

export function computeSisoRequiredFees(ecRate) {
  return new Big(buildTransaction([DUMMY_IO], [DUMMY_IO]).computeRequiredFees(ecRate, { rcdType: 1 }));
}

/**
 * Compute minimum required fees for a given set of inputs and outputs
 */
export function computeRequiredFees(inputs, outputs, ecRate) {
  return new Big(buildTransaction(inputs, outputs).computeRequiredFees(ecRate, { rcdType: 1 }));
}

/**
 * Build transaction from inputs and outputs denominated if **Factoids**
 */
export function buildTransaction(inputs, outputs, keystore) {
  const txBuilder = Transaction.builder();

  for (const input of inputs) {
    if (keystore) {
      txBuilder.input(keystore.getSecretKey(input.address), toInt(FACTOSHI_MULTIPLIER.times(input.amount)));
    } else {
      txBuilder.input(input.address, toInt(FACTOSHI_MULTIPLIER.times(input.amount)));
    }
  }

  for (const output of outputs) {
    txBuilder.output(output.address, toInt(FACTOSHI_MULTIPLIER.times(output.amount)));
  }

  return txBuilder.build();
}

function toInt(bn) {
  return bn.integerValue().toNumber();
}
