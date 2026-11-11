import { hashStr } from './format';

export async function hashPw(pw, salt) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'weak:' + hashStr(salt + pw);
  }
}
