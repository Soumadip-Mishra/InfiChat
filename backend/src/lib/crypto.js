import crypto from 'crypto'

export const generatePublicPrivateKey = async () => {
	const key = crypto.generateKeyPairSync("ec", {
		namedCurve: "secp256k1",
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
	});
	return {
		privateKey: key.privateKey,
		publicKey: key.publicKey,
	};
}

export const encryptWithPassword = async (text, password) => {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12); 
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag(); 
  
  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted
  });
};

export const decryptWithPassword = async (encryptedStr, password) => {
  const encryptedObj = JSON.parse(encryptedStr);
  const { salt, iv, authTag, encryptedData } = encryptedObj;
  const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex')); 
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted.toString();
};
