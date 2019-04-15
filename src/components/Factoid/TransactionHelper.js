import Promise from 'bluebird';
import { Transaction } from 'factom';

export async function buildTransaction(store, totalBalance, balances, outputAddress, amount) {
  const ecRate = await store.getters['factomd/cli'].getEntryCreditRate();
  const outputAmount = outputAddress[0] === 'E' ? amount.times(ecRate) : amount;

  const tx = getFeeAdjustedTransaction(totalBalance, balances, outputAddress, outputAmount, ecRate);
  // Get inputs secret keys
  const keystore = store.state.keystore.store;
  const inputsSecrets = await Promise.map(tx.inputs, function(input) {
    const secret = keystore.getSecretKey(input.address);
    return { secret, amount: input.amount };
  });

  // Build signed transaction with correct fees
  const signedTxBuilder = Transaction.builder().output(outputAddress, toInt(outputAmount));
  for (const input of inputsSecrets) {
    signedTxBuilder.input(input.secret, input.amount);
  }
  signedTxBuilder.build();

  return signedTxBuilder.build();
}

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

function toInt(bn) {
  return bn.integerValue().toNumber();
}
