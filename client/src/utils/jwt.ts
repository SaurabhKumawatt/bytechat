export interface JWTPayload {
  userId: string;
  phone: string;
  exp?: number;
  iat?: number;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64 string');
    }
    base64 += new Array(5 - pad).join('=');
  }
  return atob(base64);
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;

    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        console.error('Token expired');
        return null;
      }
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(parts[1])) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
};
