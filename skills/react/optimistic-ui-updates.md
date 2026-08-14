---
name: ReactOptimisticUiUpdates
desc: Pattern for instantaneous UI mutations with automated rollback and user signaling upon server rejection
rules: [R_REACT]
category: React
---
# ⚡ React Optimistic UI Updates & Automated Rollback

**Goal:** Deliver ultra-fast user experiences by updating the UI instantly upon user action, then performing the API request in the background, automatically reverting state and alerting the user if the server rejects.

---

## 1. Optimistic Mutation Pattern

```javascript
import React, { useState } from 'react';
import { keyService } from '@/services/keyService';
import Swal from 'sweetalert2';

export function KeyToggleSwitch({ keyItem }) {
  const [isActive, setIsActive] = useState(keyItem.isActive);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    // 1. Snapshot previous state for rollback
    const previousState = isActive;
    const nextState = !previousState;

    // 2. Apply Optimistic Update immediately
    setIsActive(nextState);
    setIsPending(true);

    try {
      // 3. Perform network call
      await keyService.updateStatus(keyItem.id, nextState);
    } catch (error) {
      // 4. Rollback to snapshot on failure
      setIsActive(previousState);
      Swal.fire({
        title: 'Operation Failed',
        text: error.message || 'Could not update key status. Reverted.',
        icon: 'error'
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      className={`btn ${isActive ? 'btn-success' : 'btn-secondary'}`}
      disabled={isPending}
      onClick={handleToggle}
    >
      {isPending ? 'Updating...' : isActive ? 'ACTIVE' : 'INACTIVE'}
    </button>
  );
}
```

---

## 2. Best Practices
- Always snapshot the exact prior state before mutating.
- Provide clear visual indicators if an operation is pending or failed.
- Use on high-frequency, low-conflict actions (Toggles, Likes, Archive, Sorting).
