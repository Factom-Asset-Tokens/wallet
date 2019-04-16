import Big from 'bignumber.js';
import flatmap from 'lodash.flatmap';
const FACTOSHI_MULTIPLIER = new Big(100000000);

export function buildTransactionsMovements(transactions, addresses) {
  const addressSet = new Set(addresses);

  return flatmap(transactions.map(tx => buildTransactionMovements(tx, addressSet)));
}

function buildTransactionMovements(tx, addressSet) {
  const result = [];

  const isCoinbase = !tx.inputs.length;

  for (let index = 0; index < tx.outputs.length; ++index) {
    const output = tx.outputs[index];

    if (addressSet.has(output.address)) {
      result.push(
        buildTransactionMovement({
          tx,
          io: output,
          sign: '+',
          isCoinbase
        })
      );
    }
  }
  for (let index = 0; index < tx.inputs.length; ++index) {
    const input = tx.inputs[index];
    if (addressSet.has(input.address)) {
      result.push(
        buildTransactionMovement({
          tx,
          io: input,
          sign: '-'
        })
      );
    }
  }

  return result;
}

function buildTransactionMovement({ tx, sign, io, isCoinbase = false }) {
  return {
    key: tx.txid + sign + io.seq_num,
    id: tx.txid,
    address: io.address,
    sign,
    amount: new Big(io.fct_amount).div(FACTOSHI_MULTIPLIER).toFormat(),
    date: tx.blockchain_date,
    coinbase: isCoinbase
  };
}
