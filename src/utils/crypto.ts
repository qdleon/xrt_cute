/**
 * Client-Side Military-Grade Encryption Utility (AES-256-GCM + PBKDF2)
 * Ensures zero-knowledge privacy: data is encrypted in the browser before being
 * sent to cloud backup endpoints or exported.
 */

export interface EncryptedVaultBundle {
  version: string;
  cipherText: string; // Base64
  iv: string;         // Base64 (12 bytes)
  salt: string;       // Base64 (16 bytes)
  checksum: string;   // SHA-256 hex hash of original plaintext
  timestamp: string;
  itemCount: number;
}

// Convert string to Uint8Array
const textEncode = (str: string): Uint8Array => new TextEncoder().encode(str);
// Convert Uint8Array to string
const textDecode = (buffer: ArrayBuffer): string => new TextDecoder().decode(buffer);

// Buffer to base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Compute SHA-256 checksum
export const computeChecksum = async (data: string): Promise<string> => {
  const msgUint8 = textEncode(data) as unknown as BufferSource;
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Derive AES-256 key from passphrase & salt using PBKDF2
const deriveKey = async (passphrase: string, saltBuffer: ArrayBuffer): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncode(passphrase) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt plaintext string with AES-256-GCM using user passphrase
 */
export const encryptWithPassphrase = async (
  plaintext: string,
  passphrase: string,
  itemCount = 0
): Promise<EncryptedVaultBundle> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt.buffer);
  const checksum = await computeChecksum(plaintext);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    textEncode(plaintext) as unknown as BufferSource
  );

  return {
    version: '1.0-aes256gcm',
    cipherText: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
    checksum,
    timestamp: new Date().toISOString(),
    itemCount,
  };
};

/**
 * Decrypt AES-256-GCM bundle back to plaintext using user passphrase
 */
export const decryptWithPassphrase = async (
  bundle: EncryptedVaultBundle,
  passphrase: string
): Promise<string> => {
  try {
    const saltBuffer = base64ToBuffer(bundle.salt);
    const ivBuffer = base64ToBuffer(bundle.iv);
    const cipherBuffer = base64ToBuffer(bundle.cipherText);

    const key = await deriveKey(passphrase, saltBuffer);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      cipherBuffer
    );

    const plaintext = textDecode(decryptedBuffer);

    // Verify integrity checksum
    if (bundle.checksum) {
      const verifyHash = await computeChecksum(plaintext);
      if (verifyHash !== bundle.checksum) {
        throw new Error('数据完整性校验失败 (Checksum Mismatch)，可能已遭篡改');
      }
    }

    return plaintext;
  } catch (err: any) {
    throw new Error('解密失败：密码错误或加密数据已损坏');
  }
};

/**
 * Helper to generate CSV from tasks array
 */
export const exportToCSV = (items: Array<any>, filename = '待办台账_导出.csv') => {
  const headers = ['编号', '事项名称', '所属部门/分类', '状态', '优先级', '截止日期', '预估工时', '备注详情', '创建时间'];
  const rows = items.map(i => [
    `"${i.id || ''}"`,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${(i.department || i.project || '').replace(/"/g, '""')}"`,
    `"${i.status || ''}"`,
    `"${i.priority || ''}"`,
    `"${i.dueDate || ''}"`,
    `"${i.points || 0}"`,
    `"${(i.description || i.notes || '').replace(/"/g, '""')}"`,
    `"${i.createdAt || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};
