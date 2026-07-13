import { jwtVerify, createRemoteJWKSet } from 'jose';
import { config } from '../config';

// Cache the JWKS
let JWKS: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function verifyJWT(token: string): Promise<any> {
  // If remote JWKS URL is provided, use OIDC JWKS
  if (config.oidcJwksUrl) {
    if (!JWKS) {
      JWKS = createRemoteJWKSet(new URL(config.oidcJwksUrl));
    }
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: config.oidcIssuerUrl,
      audience: config.oidcAudience,
    });
    return payload;
  }
  
  // Fallback to symmetric JWT Secret if provided
  if (config.jwtSecret) {
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.oidcIssuerUrl,
      audience: config.oidcAudience,
    });
    return payload;
  }

  throw new Error('JWT verification not configured. Neither OIDC_JWKS_URL nor JWT_SECRET are set.');
}
