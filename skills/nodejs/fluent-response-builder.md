---
name: NodeJsFluentResponseBuilder
desc: Fluent API response builder for consistent, type-safe, and standardized REST API payloads
rules: [R_NODE]
category: NodeJs
---
# 🏗️ Node.js Fluent API Response Builder Pattern

**Goal:** Provide a fluent, chainable builder interface to construct standardized JSON responses, preventing divergent response schemas across different controller endpoints.

---

## 1. ResponseBuilder Implementation

```javascript
export class ApiResponseBuilder {
  constructor() {
    this.statusCode = 200;
    this.success = true;
    this.data = null;
    this.message = '';
    this.errors = [];
    this.pagination = null;
    this.metadata = {
      timestamp: new Date().toISOString()
    };
  }

  status(code) {
    this.statusCode = code;
    this.success = code >= 200 && code < 300;
    return this;
  }

  withData(data) {
    this.data = data;
    return this;
  }

  withMessage(msg) {
    this.message = msg;
    return this;
  }

  withPagination({ page, pageSize, totalItems }) {
    const size = Number(pageSize) || 1;
    const total = Number(totalItems) || 0;
    this.pagination = {
      currentPage: Number(page) || 1,
      pageSize: size,
      totalItems: total,
      totalPages: Math.ceil(total / size)
    };
    return this;
  }

  withError(code, message, details = []) {
    this.success = false;
    if (this.statusCode >= 200 && this.statusCode < 300) {
      this.statusCode = 400; // Default to 400 Bad Request on error if still 2xx
    }
    this.errors.push({ code, message, details });
    return this;
  }

  withMeta(key, value) {
    this.metadata[key] = value;
    return this;
  }

  build() {
    const payload = {
      success: this.success,
      message: this.message || (this.success ? 'OK' : 'Error'),
      data: this.data,
      metadata: this.metadata
    };

    if (this.pagination) {
      payload.pagination = this.pagination;
    }

    if (this.errors.length > 0) {
      payload.errors = this.errors;
    }

    return {
      statusCode: this.statusCode,
      body: payload
    };
  }
}
```

---

## 2. Usage in Controllers & Express Routes

```javascript
export async function getKeysList(req, res) {
  const { page = 1, limit = 15 } = req.query;
  const { items, total } = await keyService.fetchKeysPaged({ page, limit });

  const response = new ApiResponseBuilder()
    .status(200)
    .withMessage('Keys retrieved successfully')
    .withData(items)
    .withPagination({ page, pageSize: limit, totalItems: total })
    .withMeta('requestId', req.correlationId)
    .build();

  return res.status(response.statusCode).json(response.body);
}
```
