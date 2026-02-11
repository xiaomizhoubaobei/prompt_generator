/**
 * @fileoverview 安全工具 - 提供加密和解密功能
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该模块提供基于 Web Crypto API 的加密和解密功能，用于保护敏感数据。
 * 使用 AES-GCM 算法，密钥派生自用户提供的密码或固定密钥。
 * 
 * 支持的功能：
 * - encrypt: 加密字符串
 * - decrypt: 解密字符串
 * 
 * 使用方式：
 * ```ts
 * import { encrypt, decrypt } from './security'
 * const encrypted = encrypt('sensitive data')
 * const decrypted = decrypt(encrypted)
 * ```
 */

const ENCRYPTION_KEY = 'prompt-generator-secure-key-2026'
const ALGORITHM = 'AES-GCM'

/**
 * 从固定密钥派生加密密钥
 * @returns Promise<CryptoKey> 派生的加密密钥
 */
async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('salt-2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 加密字符串
 * @param plaintext 要加密的明文字符串
 * @returns Promise<string> Base64 编码的加密数据（包含 IV）
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return ''
  
  try {
    const key = await deriveKey()
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(plaintext)
    )
    
    // 将 IV 和加密数据合并，然后转换为 Base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('加密失败:', error)
    return plaintext
  }
}

/**
 * 解密字符串
 * @param ciphertext Base64 编码的加密数据（包含 IV）
 * @returns Promise<string> 解密后的明文字符串
 */
export async function decrypt(ciphertext: string): Promise<string> {
  if (!ciphertext) return ''
  
  try {
    const key = await deriveKey()
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    )
    
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('解密失败:', error)
    return ciphertext
  }
}