const crypto = require('crypto');


const ENCRYPTION_KEY =  Buffer.from(process.env.ENCRYPTION_KEY, 'hex');; 
const IV_LENGTH = 16; 

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY).length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY: It must be a 32-byte value.');
  }
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};


const decrypt = (encryptedText) => {
  const [iv, encrypted] = encryptedText.split(':').map(part => Buffer.from(part, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc',ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};


const encryptResponseMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }
    const encryptedData = encrypt(body);
    originalSend.call(this, encryptedData);
  };

  next();
};

module.exports = {
  encryptResponseMiddleware,
  decrypt,
};
