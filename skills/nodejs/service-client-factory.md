---
name: NodeJsServiceClientFactory
desc: Managed API Client Factory with automatic authorization token delegation and retry configuration
rules: [R_NODE]
category: NodeJs
---
# 🌐 Node.js Service Client Factory Pattern

**Goal:** Provide secure, pre-configured HTTP client instances for external API microservices, automatically delegating incoming user credentials (OAuth/JWT) and setting up timeouts, correlation IDs, and retry policies.

---

## 1. ServiceClientFactory Implementation

```javascript
import axios from 'axios';

export class ServiceClientFactory {
  constructor({ authorizationToken, correlationId, timeoutMs = 5000 }) {
    this.authorizationToken = authorizationToken;
    this.correlationId = correlationId;
    this.timeoutMs = timeoutMs;
  }

  createClient(baseURL) {
    const instance = axios.create({
      baseURL,
      timeout: this.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authorizationToken ? { Authorization: `Bearer ${this.authorizationToken}` } : {}),
        ...(this.correlationId ? { 'x-correlation-id': this.correlationId } : {})
      }
    });

    // Interceptor: Log outgoing external requests
    instance.interceptors.request.use((config) => {
      console.log(`[EXTERNAL CALL] -> ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });

    // Interceptor: Standardize error handling
    instance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        throw new Error(`[Service Client Error ${status}]: ${message}`);
      }
    );

    return instance;
  }
}
```

---

## 2. Usage in Request Handlers

```javascript
export const FetchInventoryStatusHandler = {
  canHandle(ctx) {
    return ctx.action === 'GET_INVENTORY_STATUS';
  },
  async handle(ctx) {
    // 1. Instantiate factory from current request context
    const clientFactory = new ServiceClientFactory({
      authorizationToken: ctx.token,
      correlationId: ctx.correlationId
    });

    // 2. Obtain pre-authenticated client for target ERP microservice
    const erpClient = clientFactory.createClient(process.env.ERP_SERVICE_API_URL);
    const data = await erpClient.get('/inventory/summary');

    return { success: true, data };
  }
};
```
