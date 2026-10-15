---
name: ReactCompoundComponentsPattern
desc: Compound components pattern using React Context for highly customizable, clean, and flexible UI component suites
rules: [R_REACT]
category: React
---
# 🧩 React Type-Safe Compound Components & Slot Architecture

**Goal:** Eliminate monolithic "Boolean Prop Explosion" components (`showFooter`, `hideHeader`, `hasExportButton`, `isCompactHeader`) by composing declarative sub-components (`<DataTable>`, `<DataTable.Header>`, `<DataTable.Row>`, `<DataTable.Empty>`) backed by a strictly-typed React Context.

---

## 1. Quantitative Component Composition Invariants
| Architectural Metric | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Boolean Configuration Props** | $\le 4$ boolean props per component | Refactor $> 5$ boolean flags into Compound Sub-Components / Slots |
| **Context Boundary Guard** | $100\%$ of sub-components validate parent Context | Custom hook `useDataTableContext()` throws descriptive error if `null` |
| **Context Value Stability** | $100\%$ memoized via `useMemo` | Prevents unnecessary re-renders across compound children |
| **Prop Drilling Depth** | $\le 2$ levels | Share implicit selection/expansion state via scoped Context |

---

## 2. Code Comparison: Boolean Prop Explosion vs Type-Safe Compound Components

```tsx
// ❌ BAD: Boolean Prop Explosion (rigid layout order, impossible to customize toolbar slots)
<LegacyDataGrid
  data={orders}
  showHeader={true}
  showSearchInput={true}
  showExportCsvButton={true}
  showPaginationFooter={false}
  customHeaderRightElement={<RefreshBtn />}
/>

// ✅ GOOD: Expressive Compound Component composition with zero boolean flags and full layout control
<DataTable data={orders} rowKey={r => r.id}>
  <DataTable.Header columns={['Order #', 'Customer', 'Status']} />
  <DataTable.Body
    renderRow={order => (
      <DataTable.Row key={order.id} rowId={order.id}>
        <td>{order.orderNo}</td>
        <td>{order.customerName}</td>
        <td><StatusBadge status={order.status} /></td>
      </DataTable.Row>
    )}
  />
  <DataTable.Empty>No matching orders found.</DataTable.Empty>
</DataTable>
```

---

## 3. Production TypeScript Implementation (`Object.assign` Compound Pattern)

```tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

interface DataTableContextValue<T> {
  readonly rows: readonly T[];
  readonly selectedId: string | null;
  readonly selectRow: (id: string) => void;
  readonly getRowKey: (row: T) => string;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

function useDataTableContext<T>(): DataTableContextValue<T> {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error('DataTable.* sub-components must be rendered inside a <DataTable> root.');
  }
  return ctx;
}

export interface DataTableRootProps<T> {
  readonly data: readonly T[];
  readonly rowKey: (row: T) => string;
  readonly children: React.ReactNode;
}

function DataTableRoot<T>({ data, rowKey, children }: DataTableRootProps<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const contextValue = useMemo<DataTableContextValue<T>>(
    () => ({ rows: data, selectedId, selectRow: setSelectedId, getRowKey: rowKey }),
    [data, selectedId, rowKey]
  );

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="rounded border border-slate-200 overflow-hidden">{children}</div>
    </DataTableContext.Provider>
  );
}

function DataTableHeader({ columns }: { readonly columns: readonly string[] }) {
  return (
    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase">
      <tr>{columns.map(col => <th key={col} className="px-4 py-2">{col}</th>)}</tr>
    </thead>
  );
}

function DataTableBody<T>({ renderRow }: { readonly renderRow: (row: T) => React.ReactNode }) {
  const { rows } = useDataTableContext<T>();
  if (rows.length === 0) return null;
  return <tbody className="divide-y divide-slate-100">{rows.map(renderRow)}</tbody>;
}

function DataTableRow({ rowId, children }: { readonly rowId: string; readonly children: React.ReactNode }) {
  const { selectedId, selectRow } = useDataTableContext();
  const isSelected = selectedId === rowId;
  return (
    <tr
      aria-selected={isSelected}
      onClick={() => selectRow(rowId)}
      className={isSelected ? 'bg-blue-50 cursor-pointer' : 'hover:bg-slate-50 cursor-pointer'}
    >
      {children}
    </tr>
  );
}

function DataTableEmpty({ children }: { readonly children: React.ReactNode }) {
  const { rows } = useDataTableContext();
  return rows.length === 0 ? <div className="p-8 text-center text-slate-500">{children}</div> : null;
}

export const DataTable = Object.assign(DataTableRoot, {
  Header: DataTableHeader,
  Body: DataTableBody,
  Row: DataTableRow,
  Empty: DataTableEmpty,
});
```

