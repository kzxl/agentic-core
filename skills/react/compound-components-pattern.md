---
name: ReactCompoundComponentsPattern
desc: Compound components pattern using React Context for highly customizable, clean, and flexible UI component suites
rules: [R_REACT]
category: React
---
# 🧩 React Compound Components Pattern

**Goal:** Build highly flexible, expressive, and reusable UI components (e.g. DataTables, Modals, Dropdowns, Steppers) that share implicit state without prop drilling.

---

## 1. DataTable Compound Component Implementation

```javascript
import React, { createContext, useContext, useState } from 'react';

const TableContext = createContext(null);

function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('DataTable compound components must be rendered within a <DataTable> provider.');
  }
  return context;
}

export function DataTable({ data, children, className = 'table' }) {
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <TableContext.Provider value={{ data, selectedRow, setSelectedRow }}>
      <div className="table-responsive">
        <table className={className}>{children}</table>
      </div>
    </TableContext.Provider>
  );
}

DataTable.Header = function TableHeader({ columns }) {
  return (
    <thead>
      <tr className="table-primary">
        {columns.map((col, idx) => (
          <th key={idx}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );
};

DataTable.Body = function TableBody({ renderRow }) {
  const { data, selectedRow, setSelectedRow } = useTableContext();

  return (
    <tbody>
      {data.map((item, index) => (
        <tr
          key={item.id || index}
          className={selectedRow?.id === item.id ? 'table-active' : ''}
          onClick={() => setSelectedRow(item)}
        >
          {renderRow(item, index)}
        </tr>
      ))}
    </tbody>
  );
};
```

---

## 2. Usage in Feature Pages

```jsx
export function KeysManagerPage({ keysList }) {
  const columns = [{ label: 'ID' }, { label: 'Key Name' }, { label: 'Status' }];

  return (
    <DataTable data={keysList}>
      <DataTable.Header columns={columns} />
      <DataTable.Body
        renderRow={(key) => (
          <>
            <td>{key.id}</td>
            <td>{key.keyName}</td>
            <td><span className="badge badge-success">{key.status}</span></td>
          </>
        )}
      />
    </DataTable>
  );
}
```
