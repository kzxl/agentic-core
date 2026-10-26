---
name: ReactOptimisticUiUpdates
desc: Pattern for instantaneous UI mutations with automated rollback and user signaling upon server rejection.
rules: [R_REACT]
category: React
---
# ⚡ React Optimistic UI Updates & Automated Rollback Protocol

**Goal:** Deliver sub-16ms perceived interaction latency by applying deterministic cache updates in `onMutate`, cancelling competing background refetches (`cancelQueries`), automatically rolling back to an immutable snapshot in `onError`, and reconciling server state in `onSettled`.

---

## 1. Quantitative Optimistic Mutation Invariants
| Lifecycle Stage | Mandatory Operation | Failure Mode Prevented |
| :--- | :--- | :--- |
| **1. `onMutate` Pre-Flight** | `await queryClient.cancelQueries({ queryKey })` | Stale in-flight `GET` response overwriting optimistic state |
| **2. Snapshot Capture** | `const previous = queryClient.getQueryData<T>(queryKey)` | Irrecoverable UI corruption on `4xx`/`5xx` server rejection |
| **3. Immutable Cache Write** | `queryClient.setQueryData<T>(queryKey, old => ...)` | Mutating cached objects in-place fails to trigger React re-render |
| **4. `onError` Rollback** | Restore `context.previous` + surface toast notification | Silent failure leaving user with false confirmation |
| **5. `onSettled` Reconciliation** | `queryClient.invalidateQueries({ queryKey })` | Client-server state drift on server-computed fields |

---

## 2. The 4-Phase Optimistic Mutation Lifecycle

```text
[User Action: Toggle / Reorder / Edit]
                  │
                  ▼
[1. onMutate]  ──► Cancel in-flight GETs -> Snapshot current cache -> Write optimistic cache -> Return { previous }
                  │
       ┌──────────┴──────────┐
       ▼ (2xx Success)       ▼ (4xx/5xx Error)
[2a. onSuccess]       [2b. onError] ──► Restore `context.previous` into cache + notify user
       │                     │
       └──────────┬──────────┘
                  ▼
[3. onSettled] ──► Invalidate target queryKey to sync canonical server state
```

---

## 3. Code Comparison: Naive Local-State Mutation vs TanStack Query Optimistic Rollback

```tsx
// ❌ BAD: Duplicating server state into local useState without cancelling in-flight queries
export function BadTaskStatusToggle({ task }: { task: TaskDTO }) {
  const [done, setDone] = useState(task.isCompleted); // Desynchronizes from global query cache!

  const handleClick = async () => {
    setDone(!done); // Race condition if user double-clicks or background query refetches!
    await api.patch(`/tasks/${task.id}`, { isCompleted: !done }); // Unhandled error leaves UI corrupt!
  };

  return <input type="checkbox" checked={done} onChange={handleClick} />;
}

// ✅ GOOD: Deterministic TanStack Query optimistic lifecycle with race cancellation and rollback
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ToggleTaskVariables {
  readonly taskId: string;
  readonly isCompleted: boolean;
}

export function useToggleTaskMutation(projectId: string) {
  const queryClient = useQueryClient();
  const listKey = ['projects', projectId, 'tasks'] as const;

  return useMutation({
    mutationFn: ({ taskId, isCompleted }: ToggleTaskVariables) =>
      taskApi.updateStatus(taskId, { isCompleted }),

    onMutate: async ({ taskId, isCompleted }) => {
      // 1. Cancel any outgoing refetches so they cannot overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: listKey });

      // 2. Snapshot exact prior cache state for deterministic rollback
      const previousTasks = queryClient.getQueryData<readonly TaskDTO[]>(listKey);

      // 3. Immutably update the cached list
      queryClient.setQueryData<readonly TaskDTO[]>(listKey, old =>
        old?.map(item => (item.id === taskId ? { ...item, isCompleted } : item)) ?? []
      );

      return { previousTasks };
    },

    onError: (err, _variables, context) => {
      // 4. Restore snapshot immediately if mutation fails
      if (context?.previousTasks) {
        queryClient.setQueryData(listKey, context.previousTasks);
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update task status. Reverted.');
    },

    onSettled: () => {
      // 5. Always refetch in background to guarantee server truth
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}
```

---

## 4. When to Use vs When to Forbid Optimistic Updates
- **Authorized:** High-frequency, low-failure, reversible actions (status toggles, kanban reordering, bookmarks).
- **Strictly Forbidden:** Financial ledger postings, stock reservations with contention, payment captures, or bulk deletions—always show `isPending` and await `200 OK`.
