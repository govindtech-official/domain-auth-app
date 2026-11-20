import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as aesjs from 'aes-js';

/**
 * Session storage for iOS / Android.
 *
 * Supabase sessions (access + refresh token) can exceed the ~2 KB limit some
 * iOS versions enforce on Keychain items, so we use the pattern recommended by
 * Supabase: a random AES-256 key per entry lives in the Keychain / Keystore
 * (expo-secure-store) and only the encrypted session lives in AsyncStorage.
 * Tokens are therefore never stored in plain text on the device.
 */
class LargeSecureStore {
  private keyName(key: string) {
    // SecureStore keys may only contain alphanumerics, ".", "-" and "_".
    return `${key.replace(/[^a-zA-Z0-9._-]/g, '_')}.enc_key`;
  }

  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = Crypto.getRandomBytes(256 / 8);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(this.keyName(key), aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encrypted);
  }

  private async decrypt(key: string, value: string): Promise<string | null> {
    const encryptionKeyHex = await SecureStore.getItemAsync(this.keyName(key));
    if (!encryptionKeyHex) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)));
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(key, encrypted);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(this.keyName(key));
  }
}

export const authStorage = new LargeSecureStore();
export const storageLabel = 'Encrypted (Keychain / Keystore)';
