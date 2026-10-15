---
desc: Node.js Security Baseline, Middleware Pipelines & Graceful Shutdown
rules: [R_NODE, R_RES]
---
# 🛡️ Node.js Security & Middleware Standards

## 1. Architectural Invariants & Quantitative Thresholds

| Security Control | Mandatory Threshold / Configuration | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Request Body Size Cap** | JSON: `<= 256 KB` (`1 MB` max); Multipart: explicit route limit | `express.json({ limit: '256kb' })` |
| **Rate Limiting (Redis Sliding Window)** | Auth routes: `10 req / min / IP`; General API: `120 req / min / user` | `rate-limiter-flexible` backed by Redis |
| **JWT Access Token Lifespan** | `<= 15 minutes` (`RS256` / `EdDSA` asymmetric verification) | Explicit `algorithms: ['EdDSA', 'RS256']` |
| **HSTS & CSP Headers** | `max-age=63072000; includeSubDomains; preload`, strict CSP | `helmet()` middleware on all routes |
| **Outbound HTTP / Webhook SSRF** | `0` requests to RFC 1918 / link-local (`169.254.169.254`, `10.0.0.0/8`) | Custom DNS lookup agent & URL allowlist |

---

## 2. Transport Hardening, Rate Limiting & JWT Asymmetric Verification

Never accept symmetric `HS256` tokens across distributed microservices or omit the `algorithms` whitelist in `jwt.verify()` (which enables algorithm-confusion attacks). Enforce sliding-window rate limiting before authentication and body-parsing middlewares to mitigate volumetric DoS attacks.

```typescript
// ❌ BAD: Unbounded body size, wildcard CORS with credentials, insecure jwt.verify without algorithm lock
app.use(cors({ origin: '*', credentials: true })); // Fatal CORS misconfiguration
app.use(express.json()); // Defaults to 100kb or unbounded in custom parsers; no rate limit!
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] ?? '';
  req.user = jwt.verify(token, process.env.SECRET!); // Vulnerable to alg: "none" / key confusion!
  next();
});

// ✅ GOOD: Hardened Helmet CSP/HSTS, strict payload cap, asymmetric JWT verification with kid rotation
import helmet from 'helmet';
import jwt from 'jsonwebtoken';

app.use(
  helmet({
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], objectSrc: ["'none'"] },
    },
  }),
);
app.use(express.json({ limit: '256kb', strict: true }));

export function verifyAccessToken(token: string, publicKeyPem: string): JwtPayload {
  return jwt.verify(token, publicKeyPem, {
    algorithms: ['RS256', 'EdDSA'],
    issuer: 'https://auth.internal.corp',
    audience: 'api-gateway',
    clockTolerance: 5,
  }) as JwtPayload;
}
```

---

## 3. Prototype Pollution Defense & Outbound SSRF Guard

- **Prototype Pollution Prevention:** Never recursively merge untrusted JSON objects into plain `{}` targets without stripping `__proto__`, `constructor`, and `prototype` keys. Use `Object.create(null)` for dynamic lookup dictionaries or `Map<string, T>`, and enforce `.strict()` on all Zod schemas.
- **SSRF Outbound Allowlisting:** When fetching user-supplied URLs (webhooks, avatar imports, OIDC discovery), validate the parsed URL protocol (`https:` only), verify the hostname against an explicit allowlist, and inspect the resolved DNS IP address before connecting to block DNS rebinding against cloud metadata endpoints (`169.254.169.254`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`).

```typescript
// ❌ BAD: Recursive object merge allows {"__proto__": {"isAdmin": true}} & unvalidated fetch enables SSRF
export async function updateWebhookBad(target: Record<string, any>, input: Record<string, any>) {
  for (const key of Object.keys(input)) {
    target[key] = input[key]; // Pollutes Object.prototype if key === '__proto__'!
  }
  return fetch(target.callbackUrl); // Attacker passes http://169.254.169.254/latest/meta-data/iam/
}

// ✅ GOOD: Dangerous key rejection + strict HTTPS & private-IP SSRF block
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function safeAssign<T extends Record<string, unknown>>(target: T, patch: Record<string, unknown>): T {
  for (const [k, v] of Object.entries(patch)) {
    if (FORBIDDEN_KEYS.has(k)) throw new SecurityViolationError(`Illegal property key: ${k}`);
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      (target as Record<string, unknown>)[k] = v;
    }
  }
  return target;
}
```

---

## 4. Unified Error Boundary & Zero Stack Leakage

Register a 4-argument Express error middleware `(err, req, res, next)` as the final middleware in the pipeline. Log full error stack traces internally with `req.id`, but return a sanitized RFC 7807 / canonical envelope `{ success: false, error: { code, message, traceId } }` with **zero internal stack traces, SQL table names, or file paths** exposed in `NODE_ENV === 'production'`.

