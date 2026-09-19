import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'toktickit-secret-key-lab03';

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

export function createSessionToken(payload: { userId: number; email: string; role: string }): string {
  const data: SessionPayload = {
    ...payload,
    iat: Date.now()
  };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Data)
    .digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Data, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Data)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr) as SessionPayload;
    return payload;
  } catch (err) {
    return null;
  }
}
