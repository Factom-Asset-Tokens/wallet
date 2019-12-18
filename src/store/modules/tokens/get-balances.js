import Promise from 'bluebird';
import { standardizeId } from '@/components/Token/Fat1Token/nf-token-ids.js';
const { mergeContiguousIds } = require('@/components/Token/Fat1Token/nf-token-ids.js');
import flatmap from 'lodash.flatmap';

export default function getBalances(cli, addresses) {
  switch (cli.getType()) {
    case 'FAT-0':
      return getFat0Balances(cli, addresses);
    case 'FAT-1':
      return getFat1Balances(cli, addresses);
    default:
      throw new Error(`Unknown FAT type: ${cli.getType()}`);
  }
}

async function getFat0Balances(cli, addresses) {
  return Promise.reduce(
    addresses,
    async function(acc, address) {
      acc[address] = await cli.getBalance(address);
      return acc;
    },
    {}
  );
}

async function getFat1Balances(cli, addresses) {
  return Promise.reduce(
    addresses,
    async function(acc, address) {
      const result = {};
      result.balance = await cli.getBalance(address);
      if (result.balance.gt(0)) {
        const nfBalances = [];
        let nfBalance = [];

        const limit = 100000;
        let i = 1;
        do {
          nfBalance = await cli.getNFBalance({
            address,
            limit,
            page: i,
            order: 'asc'
          });
          nfBalances.push(nfBalance.map(standardizeId));

          i++;
        } while (nfBalance.length > 0);

        result.ids = mergeContiguousIds(flatmap(nfBalances));
      } else {
        result.ids = [];
      }

      acc[address] = result;
      return acc;
    },
    {}
  );
}
