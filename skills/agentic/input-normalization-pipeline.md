---
name: AgenticInputNormalizationPipeline
desc: Pre-action input normalization and micro-payload ingestion pipeline for noise filtering and zero-drift execution
rules: [R_CORE]
category: Agentic
---
# 📥 Agentic Input Normalization Pipeline

**Goal:** Eliminate natural language noise, prevent attention dispersion, and convert any user prompt into a high-density, structured **Micro-Payload** before planning or executing code.

---

## 1. The Pre-Action Ingestion Flow

```
                            [USER INPUT PROMPT]
                                     │
                         ┌───────────▼───────────┐
                         │ Step 1: Format Detect │
                         └───────────┬───────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
           [Structured Micro-Payload]          [Free-Form Natural Text]
                   │                                   │
                   ▼ (Fast Path)                       ▼ (Auto-Normalize)
            Direct Slot Injection              Extract: Action, Target,
            to Working Memory                  Core Intent, Inferred Tags
                   │                                   │
                   └─────────────────┬─────────────────┘
                                     │
                                     ▼
                     [NORMALIZED EXECUTION PAYLOAD]
                   (Ready for PRE-Fetch & Reasoning)
```

---

## 2. The Standard Micro-Payload Schema

```
[ACTION] @[FEATURE_TARGET] | [CORE_INTENT_OR_SYMPTOM] | [RULES_AND_TAGS]
```

### Canonical Fields (The 4 Slots):
1. **`action`**: `FIX`, `ADD`, `REFACTOR`, `QUERY`, `AUDIT`, `EXPORT`.
2. **`target`**: `@<Domain>.<Feature>` (e.g. `@Inventory.StockOut`, `@Sales.Packing`).
3. **`intent`**: Single-sentence concise description of the root goal or symptom (noise-free).
4. **`tags`**: Active rules & skill codes (e.g. `[R_CS, R_WPF, BASE, PART, PERF, PONY]`).

---

## 3. Auto-Normalization Matrix (Free-Form &rarr; Normalized)

| User Free-Form Input | Pre-Action Auto-Normalized Payload |
| :--- | :--- |
| *"Màn hình xuất kho bị đơ khi double click vào bảng, xem giúp đừng làm lỗi chỗ khác nhé."* | `FIX @Inventory.StockOut \| Double-click grid freeze UI \| [BLAST, PERF, BASE, PONY]` |
| *"Tạo API lưu phiếu đóng gói bên Sales, nhớ bọc transaction và chia partial."* | `ADD @Sales.Packing \| API save packing ticket \| in: PackingDTO \| [R_API, PART, PONY]` |
| *"Rà soát lại toàn bộ hàm trong MaterialService xem có bị thừa code không."* | `AUDIT @Inventory.MaterialService \| Review for over-engineering \| [PONY, BLAST]` |

---

## 4. Slot-Filling Fallback (Ambiguity Resolution)

If the incoming prompt lacks critical slots (e.g., *"Sửa lỗi lưu dữ liệu"*):
- **NEVER GUESS OR HALLUCINATE.**
- Immediately present a 2-question compact selector before coding:
  ```text
  Missing Execution Slots:
  1. Target Feature: [A] StockIn | [B] StockOut | [C] StockReturn?
  2. Symptom: [A] UI Freeze | [B] DB Validation Error | [C] Exception Crash?
  ```
