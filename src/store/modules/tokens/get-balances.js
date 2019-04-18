import Promise from 'bluebird';
import Big from 'bignumber.js';
import { standardizeId } from '@/components/Token/Fat1Token/nf-token-ids.js';

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
      const balance = await cli.getBalance(address);
      acc[address] = new Big(balance);
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

      if (result.balance > 0) {
        const nfBalance = await cli.getNFBalance({
          address,
          limit: result.balance
        });

        result.ids = nfBalance.map(standardizeId);
      } else {
        result.ids = [];
      }

      acc[address] = result;
      return acc;
    },
    {}
  );
}
