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

  result.push(getTransactionMovements(tx, addressSet, isCoinbase, 'outputs', '+', 'FCT'));
  result.push(getTransactionMovements(tx, addressSet, isCoinbase, 'ecoutputs', '+', 'EC'));
  result.push(getTransactionMovements(tx, addressSet, isCoinbase, 'inputs', '-', 'FCT'));

  return flatmap(result);
}

function getTransactionMovements(tx, addressSet, isCoinbase, attribute, sign, symbol) {
  return tx[attribute]
    .map(function(io) {
      if (addressSet.has(io.address)) {
        return buildTransactionMovement({
          tx,
          io,
          sign,
          isCoinbase,
          symbol
        });
      }
    })
    .filter(a => a);
}

function buildTransactionMovement({ tx, sign, io, symbol, isCoinbase }) {
  const amount =
    symbol === 'FCT' ? new Big(io.fct_amount).div(FACTOSHI_MULTIPLIER).toFormat() : new Big(io.ec_amount).toFormat();
  return {
    key: tx.txid + sign + io.seq_num,
    txId: tx.txid,
    address: io.address,
    sign,
    symbol,
    amount,
    date: tx.blockchain_date,
    coinbase: isCoinbase
  };
}
