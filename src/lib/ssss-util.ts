import { split, combine } from 'shamir-secret-sharing';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function uint8ArrayToHex(arr: Uint8Array): string {
	return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

export async function splitSecret(secret: string, token: string, shares: number, threshold: number): Promise<string[]> {
	const secretBytes = encoder.encode(secret);
	const shareBytes = await split(secretBytes, shares, threshold);
	
	return shareBytes.map((share, index) => {
		const shareHex = uint8ArrayToHex(share);
		return `${token}-${(index + 1).toString().padStart(2, '0')}-${shareHex}`;
	});
}

export async function combineSecret(parts: string[]): Promise<string> {
	const shareBytes = parts.map(part => {
		const lastDashIndex = part.lastIndexOf('-');
		const shareHex = part.slice(lastDashIndex + 1);
		return hexToUint8Array(shareHex);
	});
	
	const secretBytes = await combine(shareBytes);
	return decoder.decode(secretBytes);
}
