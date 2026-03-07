import { Injectable } from '@angular/core';

export interface Payload {
  v: number,
  i: string;
  s: string;
  d: string;
}

@Injectable({
  providedIn: 'root',
})
export class EncryptService {

  async encrypt(data: string, password: string): Promise<Payload> {
    const encoder = new TextEncoder();

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(data)
    );
    const result: Payload = {
      v: 1,
      s: this.toBase64(salt),
      i: this.toBase64(iv),
      d: this.toBase64(new Uint8Array(encrypted))
    };
    
    return result;
  }

  async decrypt(payload: Payload, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const salt = new Uint8Array(this.fromBase64(payload.s));
    const iv = new Uint8Array(this.fromBase64(payload.i));
    const data = new Uint8Array(this.fromBase64(payload.d));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return decoder.decode(decrypted);
  }


  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }
}
