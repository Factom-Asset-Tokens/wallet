import flatmap from 'lodash.flatmap';
import Big from 'bignumber.js';

export function buildTransactionsMovements(transactions, addresses) {
  const addressSet = new Set(addresses);

  return flatmap(transactions.map(tx => buildTransactionMovements(tx, addressSet)));
}

function buildTransactionMovements(tx, addressSet) {
  const result = [];

  const hasMetadata = typeof tx.getMetadata() !== 'undefined';
  const isCoinbase = !!tx.getInputs()['FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC'];
  const isBurn = !!tx.getOutputs()['FA1zT4aFpEvcnPqPCigB3fvGu4Q4mTXY22iiuV69DqE1pNhdF2MC'];

  for (const address in tx.getOutputs()) {
    if (addressSet.has(address)) {
      result.push(
        buildTransactionMovement({
          tx,
          address,
          sign: '+',
          amount: tx.getOutputs()[address],
          isCoinbase,
          hasMetadata
        })
      );
    }
  }
  for (const address in tx.getInputs()) {
    if (addressSet.has(address)) {
      result.push(
        buildTransactionMovement({
          tx,
          address,
          sign: '-',
          amount: tx.getInputs()[address],
          isBurn,
          hasMetadata
        })
      );
    }
  }

  return result;
}

function buildTransactionMovement({ tx, address, sign, amount, isCoinbase = false, isBurn = false, hasMetadata }) {
  return {
    txId: tx.getEntryhash(),
    address,
    sign,
    amount: getAmount(amount).toFormat(),
    timestamp: tx.getTimestamp(),
    coinbase: isCoinbase,
    burn: isBurn,
    hasMetadata,
    pending: tx.getPending()
  };
}

export function transformInoutputsToArray(inoutputs) {
  return Object.keys(inoutputs).map(address => ({
    address,
    amount: Array.isArray(inoutputs[address]) ? inoutputs[address] : new Big(inoutputs[address])
  }));
}

export function getTotalTransaction(transaction) {
  const toSum =
    Object.keys(transaction.getInputs()) < Object.keys(transaction.getOutputs())
      ? Object.values(transaction.getInputs())
      : Object.values(transaction.getOutputs());

  return toSum.map(getAmount).reduce((acc, val) => acc.plus(val), new Big(0));
}

function getAmount(amount) {
  return Array.isArray(amount) ? computeTotalBalanceOfNfTokens(amount) : new Big(amount);
}

function computeTotalBalanceOfNfTokens(tokens) {
  return new Big(
    tokens.reduce(function(acc, token) {
      switch (typeof token) {
        case 'number':
          return acc + 1;
        case 'object':
          return acc + token.max - token.min + 1;
        default:
          throw new Error('Unsupported token', token);
      }
    }, 0)
  );
}
