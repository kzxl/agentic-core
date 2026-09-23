---
name: SqlServerPlanInspection
desc: Deep execution plan inspection, XML plan extraction, wait stats diagnosis, and plan regression comparison
rules: [R_DB, R_PERF]
category: Database
---
# 🔬 SQL Server Execution Plan & Performance Regression Analysis

**Goal:** Extract, inspect, and compare SQL Server Execution Plans (Graphical & XML), diagnose plan regressions, and extract runtime vs compiled metrics from cached plans.

---

## 1. Extracting Active Cached Plans via DMVs

Extract the top CPU, I/O, or Duration queries along with their actual XML execution plans directly from the plan cache:

```sql
SELECT TOP 20
    qs.total_elapsed_time / qs.execution_count / 1000.0 AS AvgDurationMs,
    qs.total_worker_time / qs.execution_count / 1000.0 AS AvgCpuMs,
    qs.total_logical_reads / qs.execution_count AS AvgLogicalReads,
    qs.execution_count AS ExecCount,
    SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS StatementText,
    qp.query_plan AS XmlPlan,
    qs.creation_time AS PlanCompiledTime,
    qs.last_execution_time AS LastExecutionTime
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp
ORDER BY qs.total_logical_reads DESC;
```

---

## 2. Inspecting XML Plans for Critical Indicators

When analyzing `.sqlplan` XML files, search directly for these XML nodes and attributes:

### 2.1 Parameter Sniffing Clues: `ParameterCompiledValue` vs `ParameterRuntimeValue`
Look for the `<ParameterList>` node at the end of the query plan:

```xml
<ParameterList>
  <ColumnReference Column="@CustomerId" 
                   ParameterDataType="int" 
                   ParameterCompiledValue="(1042)" 
                   ParameterRuntimeValue="(98901)" />
</ParameterList>
```
- **Diagnostic:** If `ParameterCompiledValue` corresponds to a customer with 10 orders, but `ParameterRuntimeValue` corresponds to a customer with 1,000,000 orders, the plan was optimized for a tiny lookup and will choke on the larger workload.

### 2.2 Memory Grant Spills: `<Warnings>` Node
Look for spill warnings under Sort or Hash operations:

```xml
<Warnings>
  <SpillToTempDb SpillLevel="1" SpilledThreadCount="4" />
</Warnings>
```
- **Diagnostic:** Indicates the query requested too little memory grant (often due to cardinality underestimation) and had to write intermediate work tables to physical disk in `TempDB`.

### 2.3 Implicit Type Conversion Warning: `PlanAffectingConvert`
```xml
<Warnings>
  <PlanAffectingConvert ConvertIssue="Seek Plan" Expression="CONVERT_IMPLICIT(nvarchar(50),[Orders].[OrderNo],0)" />
</Warnings>
```
- **Diagnostic:** The expression forced an Index Scan across the table. Fix by altering parameter data type in the calling application.

---

## 3. Comparing Plan Regressions (Pre vs Post Changes)

When a query regresses after an index addition, server reboot, or migration, follow this comparison checklist:

| Verification Checkpoint | Baseline (Fast Plan) | Regressed (Slow Plan) | Analysis & Corrective Action |
| :--- | :--- | :--- | :--- |
| **Join Strategy** | Merge Join or Hash Join | Nested Loops Join | Indicates a severe cardinality underestimation (often caused by `@Table` variable or missing statistics). |
| **Index Access** | Index Seek | Clustered Index Scan | Predicate SARGability was broken or an index was dropped/renamed. |
| **Memory Grant** | Sufficient (0 KB Spill) | TempDB Spill Warning | Cardinality estimate was too low; optimizer requested inadequate memory. |
| **Estimated Rows** | Close to Actual Rows | Diverged by $>10\times$ | Statistics need `UPDATE STATISTICS TableName WITH FULLSCAN;`. |
| **Parallelism** | Parallel (Exchange Gather) | Serial (Single Threaded) | A scalar UDF or table variable forced serial plan execution. |

---

## 4. Live Query Session Investigation

Investigate currently executing slow queries in real-time:

```sql
SELECT 
    r.session_id,
    r.status,
    r.start_time,
    r.command,
    r.cpu_time,
    r.total_elapsed_time / 1000.0 AS ElapsedSeconds,
    r.logical_reads,
    r.wait_type,
    r.wait_time,
    r.blocking_session_id,
    st.text AS CurrentExecutingSql,
    qp.query_plan AS ExecutionPlan
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) st
CROSS APPLY sys.dm_exec_query_plan(r.plan_handle) qp
WHERE r.session_id != @@SPID 
  AND r.status NOT IN ('background', 'sleeping');
```
