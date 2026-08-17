---
name: NodeJsPersistenceAdapterPattern
desc: Pluggable storage adapter interface for state and session management in Node.js
rules: [R_NODE, R_DB]
category: NodeJs
---
# 💾 Node.js Persistence Adapter Pattern

**Goal:** Abstract storage and session state management behind a unified interface, allowing seamless switching between In-Memory, Redis, MongoDB, and SQL without altering domain logic.

## 1. Persistence Adapter Interface
```javascript
/**
 * @interface PersistenceAdapter
 */
export class BasePersistenceAdapter {
  async getAttributes(key) {
    throw new Error("getAttributes not implemented");
  }

  async saveAttributes(key, attributes, ttlSeconds = 0) {
    throw new Error("saveAttributes not implemented");
  }

  async deleteAttributes(key) {
    throw new Error("deleteAttributes not implemented");
  }
}
```

## 2. Concrete Implementations

### A. Memory Adapter (For Local Development & Unit Testing)
```javascript
export class MemoryPersistenceAdapter extends BasePersistenceAdapter {
  constructor() {
    super();
    this.store = new Map();
  }

  async getAttributes(key) {
    return this.store.get(key) || {};
  }

  async saveAttributes(key, attributes) {
    this.store.set(key, { ...attributes });
  }

  async deleteAttributes(key) {
    this.store.delete(key);
  }
}
```

### B. Redis Adapter (For Distributed Production Caching)
```javascript
export class RedisPersistenceAdapter extends BasePersistenceAdapter {
  constructor(redisClient) {
    super();
    this.client = redisClient;
  }

  async getAttributes(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : {};
  }

  async saveAttributes(key, attributes, ttlSeconds = 86400) {
    const payload = JSON.stringify(attributes);
    if (ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async deleteAttributes(key) {
    await this.client.del(key);
  }
}
```

## 3. Usage in Service Layer
```javascript
export class SessionService {
  constructor(persistenceAdapter) {
    this.adapter = persistenceAdapter;
  }

  async getSession(userId) {
    return await this.adapter.getAttributes(`session:${userId}`);
  }

  async setSession(userId, data) {
    await this.adapter.saveAttributes(`session:${userId}`, data);
  }
}
```
