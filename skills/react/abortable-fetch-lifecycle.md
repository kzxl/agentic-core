---
name: ReactAbortableFetchLifecycle
desc: AbortController lifecycle integration in React components and router listeners to prevent memory leaks and race conditions
rules: [R_REACT]
category: React
---
# 🛑 React Abortable Fetch & Request Cancellation Lifecycle

**Goal:** Eliminate unhandled promise rejections, memory leaks on unmounted components, and race conditions when users switch tabs or navigate quickly.

---

## 1. Component-Level Abort Pattern (useEffect)

```javascript
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

export function UserDeviceList({ deviceId }) {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Instantiate AbortController per effect run
    const controller = new AbortController();
    setLoading(true);

    async function fetchDetails() {
      try {
        const data = await apiClient.get(`/devices/${deviceId}`, {
          signal: controller.signal
        });
        setDeviceData(data);
      } catch (err) {
        // 2. Ignore expected AbortError
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          console.log('Fetch aborted on unmount or id change');
          return;
        }
        console.error('API Error:', err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    // 3. Cleanup: Abort request immediately on unmount/re-render
    return () => {
      controller.abort();
    };
  }, [deviceId]);

  if (loading) return <div>Loading...</div>;
  return <div>{deviceData?.deviceName}</div>;
}
```

---

## 2. Global Route-Change Abort Watcher (React Router)

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const RouteChangeAbortWatcher = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.abortAllPendingRequests) {
      window.abortAllPendingRequests();
    }
  }, [location.pathname]);

  return null;
};
```

---

## 3. Checklist
- [ ] Every `useEffect` initiating network requests passes `signal` and implements cleanup abort.
- [ ] Error handlers explicitly distinguish between genuine API errors and `AbortError`.
