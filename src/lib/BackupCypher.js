const nacl = require('tweetnacl/nacl-fast');
const { pbkdf2 } = require('fast-sha256');

export default class BackupCypher {
  cypherBackup(backup, password) {
    const data = Buffer.from(JSON.stringify(backup));
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const secretKey = deriveHashFromPassword(password, nonce);
    const encrypted = nacl.secretbox(data, nonce, secretKey);
    return {
      nonce: Buffer.from(nonce).toString('base64'),
      backup: Buffer.from(encrypted).toString('base64')
    };
  }

  decypherBackup(backup, password) {
    const nonce = Buffer.from(backup.nonce, 'base64');
    const data = Buffer.from(backup.backup, 'base64');
    const secretKey = deriveHashFromPassword(password, nonce);

    const decrypted = nacl.secretbox.open(data, nonce, secretKey);

    if (!decrypted) {
      throw new Error('Decryption failed.');
    }

    return JSON.parse(Buffer.from(decrypted, 'base64').toString());
  }
}

function deriveHashFromPassword(password, nonce) {
  return pbkdf2(Buffer.from(password), nonce, 10000, nacl.secretbox.keyLength);
}
