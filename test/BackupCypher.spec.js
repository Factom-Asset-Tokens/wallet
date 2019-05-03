const assert = require('chai').assert,
  BackupCypher = require('../src/lib/BackupCypher');

const PASSWORD = 'password';

describe('BackupCypher', function() {
  it('should cypher backup', async function() {
    const cypher = new BackupCypher();

    const backup = { field1: 1, field2: 'text' };
    const encryptedBackup = cypher.cypherBackup(backup, PASSWORD);

    assert.isObject(encryptedBackup);
    assert.isString(encryptedBackup.nonce);
    assert.isString(encryptedBackup.backup);
  });

  it('should decypher encrypted backup', async function() {
    const cypher = new BackupCypher();

    const backup = { field1: 1, field2: 'text' };

    const encryptedBackup = cypher.cypherBackup(backup, PASSWORD);
    const decypheredBackup = cypher.decypherBackup(encryptedBackup, PASSWORD);

    assert.deepEqual(decypheredBackup, backup);
  });
});
