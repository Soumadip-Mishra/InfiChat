function bufferToHex(buffer) {
	return [...new Uint8Array(buffer)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function hexToBuffer(hex) {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2)
		bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	return bytes.buffer;
}

function pemToBuffer(pem) {
	const base64 = pem
		.replace(/-----BEGIN.*?-----/, "")
		.replace(/-----END.*?-----/, "");

	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

function splitCiphertextAndTag(combined) {
	const bytes = new Uint8Array(combined);
	return {
		encrypted: bytes.slice(0, -16),
		authTag: bytes.slice(-16),
	};
}

function joinCiphertextAndTag(encryptedHex, authTagHex) {
	const encrypted = new Uint8Array(hexToBuffer(encryptedHex));
	const authTag = new Uint8Array(hexToBuffer(authTagHex));
	const combined = new Uint8Array(encrypted.length + authTag.length);
	combined.set(encrypted);
	combined.set(authTag, encrypted.length);
	return combined;
}

export async function computeSharedSecret(
	selfPrivateKeyPem,
	foreignPublicKeyPem,
) {
	try {
		const privateKey = await crypto.subtle.importKey(
			"pkcs8",
			pemToBuffer(selfPrivateKeyPem),
			{ name: "ECDH", namedCurve: "P-256" },
			false,
			["deriveBits"],
		);

		const publicKey = await crypto.subtle.importKey(
			"spki",
			pemToBuffer(foreignPublicKeyPem),
			{ name: "ECDH", namedCurve: "P-256" },
			false,
			[],
		);

		const sharedBits = await crypto.subtle.deriveBits(
			{ name: "ECDH", public: publicKey },
			privateKey,
			256,
		);

		return bufferToHex(sharedBits);
	} catch (error) {
		console.error("Error computing shared secret:", error);
	}
}

export async function encryptMessage(text, sharedSecret) {
	try {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const sharedSecretKey = await crypto.subtle.importKey(
			"raw",
			new Uint8Array(hexToBuffer(sharedSecret)),
			"HKDF",
			false,
			["deriveKey"],
		);

		const aesKey = await crypto.subtle.deriveKey(
			{
				name: "HKDF",
				hash: "SHA-256",
				salt,
				info: new TextEncoder().encode("text-encryption"),
			},
			sharedSecretKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["encrypt"],
		);

		const ciphertext = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			aesKey,
			new TextEncoder().encode(text),
		);

		const { encrypted, authTag } = splitCiphertextAndTag(ciphertext);

		return JSON.stringify({
			salt: bufferToHex(salt),
			iv: bufferToHex(iv),
			authTag: bufferToHex(authTag),
			encryptedData: bufferToHex(encrypted),
		});
	} catch (error) {
		console.error("Error encrypting message:", error);
	}
}

export async function decryptMessage(encryptedMessage, sharedSecret) {
	try {
		const { salt, iv, authTag, encryptedData } =
			JSON.parse(encryptedMessage);

		const sharedSecretKey = await crypto.subtle.importKey(
			"raw",
			new Uint8Array(hexToBuffer(sharedSecret)),
			"HKDF",
			false,
			["deriveKey"],
		);

		const aesKey = await crypto.subtle.deriveKey(
			{
				name: "HKDF",
				hash: "SHA-256",
				salt: new Uint8Array(hexToBuffer(salt)),
				info: new TextEncoder().encode("text-encryption"),
			},
			sharedSecretKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["decrypt"],
		);

		const combined = joinCiphertextAndTag(encryptedData, authTag);

		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: new Uint8Array(hexToBuffer(iv)) },
			aesKey,
			combined,
		);

		return new TextDecoder().decode(decrypted);
	} catch (error) {
		console.error("Error decrypting message:", error);
	}
}

export async function encryptImage(file, sharedSecret) {
	try {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const sharedSecretKey = await crypto.subtle.importKey(
			"raw",
			new Uint8Array(hexToBuffer(sharedSecret)),
			"HKDF",
			false,
			["deriveKey"],
		);

		const aesKey = await crypto.subtle.deriveKey(
			{
				name: "HKDF",
				hash: "SHA-256",
				salt,
				info: new TextEncoder().encode("image-encryption"),
			},
			sharedSecretKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["encrypt"],
		);

		const plaintext = await file.arrayBuffer();

		const ciphertext = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			aesKey,
			plaintext,
		);

		const combined = new Uint8Array(
			salt.length + iv.length + ciphertext.byteLength,
		);

		combined.set(salt, 0);
		combined.set(iv, salt.length);
		combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

		return new Blob([combined], { type: "application/octet-stream" });
	} catch (error) {
		console.error("Error encrypting image:", error);
	}
}

export async function decryptImage(imageURL, sharedSecret) {
	try {
		const response = await fetch(imageURL);
		const blob = await response.blob();
		const buffer = await blob.arrayBuffer();
		const data = new Uint8Array(buffer);

		const salt = data.slice(0, 16);
		const iv = data.slice(16, 28);
		const ciphertext = data.slice(28);

		const sharedSecretKey = await crypto.subtle.importKey(
			"raw",
			new Uint8Array(hexToBuffer(sharedSecret)),
			"HKDF",
			false,
			["deriveKey"],
		);

		const aesKey = await crypto.subtle.deriveKey(
			{
				name: "HKDF",
				hash: "SHA-256",
				salt,
				info: new TextEncoder().encode("image-encryption"),
			},
			sharedSecretKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["decrypt"],
		);

		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			aesKey,
			ciphertext,
		);
		const imageBlob = new Blob([decrypted]);

		return URL.createObjectURL(imageBlob);
	} catch (error) {
		console.error("Error decrypting image:", error);
	}
}
