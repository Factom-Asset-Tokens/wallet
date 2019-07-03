import Big from 'bignumber.js';
import { Transaction } from 'factom';

const FACTOSHI_MULTIPLIER = new Big(100000000);
const DUMMY_IO = { address: 'FA3syRxpYEvFFvoN4ZfNRJVQdumLpTK4CMmMUFmKGeqyTNgsg4uH', amount: new Big(0) };

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
