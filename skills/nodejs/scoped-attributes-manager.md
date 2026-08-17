---
name: NodeJsScopedAttributesManager
desc: 3-Tier Scoped State Management pattern (Request, Session, Persistent) inspired by ASK SDK v2
rules: [R_NODE, R_DB]
category: NodeJs
---
# 📦 Node.js 3-Tier Scoped Attributes Manager Pattern

**Goal:** Provide clean, decoupled state management across 3 distinct lifecycles: **Request Scope** (single execution tick), **Session Scope** (user multi-step workflow), and **Persistent Scope** (permanent database record), eliminating global variable leaks and dirty database writes.

---

## 1. The 3 Lifecycle Scopes

```
+-------------------------------------------------------------+
| 1. Request Scope (Ephemeral in-memory, lasts 1 request)     |
|    - Correlation ID, startTime, auth context, temp flags    |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| 2. Session Scope (Multi-turn conversational / workflow)     |
|    - Form draft, step index, temporary user preferences     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| 3. Persistent Scope (Durable database storage via Adapter)  |
|    - User profile, permanent activation logs, audit history |
+-------------------------------------------------------------+
```

---

## 2. AttributesManager Implementation

```javascript
export class AttributesManager {
  constructor({ requestEnvelope, persistenceAdapter, sessionStore }) {
    this.requestAttributes = {};
    this.sessionAttributes = sessionStore || {};
    this.persistenceAdapter = persistenceAdapter;
    this.persistentAttributes = null;
    this.sessionKey = requestEnvelope?.sessionId;
    this.persistentKey = requestEnvelope?.userId;
  }

  // --- 1. Request Scope ---
  getRequestAttributes() {
    return this.requestAttributes;
  }
  setRequestAttributes(attrs) {
    this.requestAttributes = { ...this.requestAttributes, ...attrs };
  }

  // --- 2. Session Scope ---
  getSessionAttributes() {
    return this.sessionAttributes;
  }
  setSessionAttributes(attrs) {
    this.sessionAttributes = { ...this.sessionAttributes, ...attrs };
  }

  // --- 3. Persistent Scope ---
  async getPersistentAttributes() {
    if (!this.persistenceAdapter) {
      throw new Error('No PersistenceAdapter configured.');
    }
    if (!this.persistentKey) {
      throw new Error('Cannot access persistent attributes: persistentKey (userId) is undefined.');
    }
    if (!this.persistentAttributes) {
      this.persistentAttributes = (await this.persistenceAdapter.getAttributes(this.persistentKey)) || {};
    }
    return this.persistentAttributes;
  }

  setPersistentAttributes(attrs) {
    this.persistentAttributes = { ...(this.persistentAttributes || {}), ...attrs };
  }

  async savePersistentAttributes() {
    if (!this.persistenceAdapter || !this.persistentKey) {
      throw new Error('Cannot save persistent attributes: missing adapter or persistentKey.');
    }
    if (this.persistentAttributes) {
      await this.persistenceAdapter.saveAttributes(this.persistentKey, this.persistentAttributes);
    }
  }
}
```

---

## 3. Usage in Request Handlers

```javascript
export const DeviceActivationHandler = {
  canHandle(handlerInput) {
    return handlerInput.action === 'ACTIVATE_DEVICE';
  },
  async handle(handlerInput) {
    const { attributesManager } = handlerInput;

    // 1. Read ephemeral request context
    const reqAttrs = attributesManager.getRequestAttributes();
    console.log(`Processing with CorrelationId: ${reqAttrs.correlationId}`);

    // 2. Read & Mutate durable database attributes
    const persistentAttrs = await attributesManager.getPersistentAttributes();
    persistentAttrs.lastActivationDate = new Date().toISOString();
    persistentAttrs.activationCount = (persistentAttrs.activationCount || 0) + 1;

    attributesManager.setPersistentAttributes(persistentAttrs);
    await attributesManager.savePersistentAttributes(); // Commits to DB

    return { success: true, count: persistentAttrs.activationCount };
  }
};
```

---

## 4. Key Advantages
- **No Direct DB Calls in Handlers:** Handlers manipulate local POJO objects; persistence is managed via lazy loading and explicit commit.
- **Unit Test Friendly:** Mocking `AttributesManager` in unit tests requires zero database setup.
