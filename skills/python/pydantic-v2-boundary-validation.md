---
name: PydanticV2BoundaryValidation
desc: Zero-overhead TypeAdapter parsing, strict mode schemas, discriminated unions, and custom validators
rules: [R_PY, R_API, R_SEC]
category: Python
---
# 🛡️ Python Pydantic v2 Boundary Validation & Schema Hardening

## 1. Architectural Invariants & Quantitative Thresholds

| Metric / Invariant | Mandatory Threshold | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Schema Unknown Field Policy** | `extra='forbid'` on `100%` of inbound API request models | Base model `ConfigDict(extra='forbid', strict=True)` |
| **JSON Deserialization Path** | `model_validate_json(raw_bytes)` (`0` intermediate `json.loads()`) | Direct Rust `pydantic-core` single-pass parsing |
| **`TypeAdapter` Instantiation** | Module-level singleton (`0` `TypeAdapter(...)` calls inside functions) | Pre-compiled Rust validator reuse |
| **Polymorphic Union Dispatch** | `Field(discriminator='type')` (`O(1)` tag lookup) | Prohibited untagged `Union[A, B, C]` linear scans |
| **String & Collection Bounds** | `max_length` on all strings (`<= 4096`) and lists (`<= 500`) | Mitigates memory exhaustion & ReDoS payloads |

---

## 2. Strict Base Model Configuration & Single-Pass Rust JSON Parsing

Pydantic v2 executes validation in Rust (`pydantic-core`). Calling `MyModel(**json.loads(body))` parses JSON twice—allocating CPython `dict` objects before walking them again in Rust. Always call `model_validate_json(raw_bytes)` or a module-scoped `TypeAdapter` for single-pass UTF-8 validation (`3x–5x` faster).

```python
import json
from typing import Annotated, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, TypeAdapter, model_validator

# ❌ BAD: Legacy v1 syntax, json.loads double-parsing, silent coercion ("123" -> 123), allows extra fields
class PaymentRequestBad(BaseModel):
    user_id: str
    amount: float  # Floating-point precision loss on currency!
    metadata: dict = {}  # Unbounded dict allows nested payload injection

def parse_bad(raw_body: bytes) -> PaymentRequestBad:
    return PaymentRequestBad.parse_obj(json.loads(raw_body))


# ✅ GOOD: Frozen strict base model, integer minor units, discriminated union, module-level TypeAdapter
class StrictBoundaryModel(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid", frozen=True, str_strip_whitespace=True)

class CardInstrument(StrictBoundaryModel):
    kind: Literal["card"]
    token: Annotated[str, Field(min_length=16, max_length=64, pattern=r"^tok_[a-zA-Z0-9]+$")]
    last4: Annotated[str, Field(min_length=4, max_length=4, pattern=r"^\d{4}$")]

class BankTransferInstrument(StrictBoundaryModel):
    kind: Literal["ach"]
    routing_number: Annotated[str, Field(min_length=9, max_length=9, pattern=r"^\d{9}$")]
    account_id: UUID

PaymentInstrument = Annotated[
    CardInstrument | BankTransferInstrument,
    Field(discriminator="kind"),  # O(1) Rust tag dispatch instead of O(N) union backtracking
]

class CreatePaymentRequest(StrictBoundaryModel):
    idempotency_key: UUID
    amount_cents: Annotated[int, Field(gt=0, le=100_000_000)]
    currency: Literal["USD", "EUR", "VND"]
    instrument: PaymentInstrument

    @model_validator(mode="after")
    def verify_ach_limit(self) -> "CreatePaymentRequest":
        if self.instrument.kind == "ach" and self.amount_cents > 5_000_000:
            raise ValueError("ACH transfers cannot exceed 50,000.00 in minor units")
        return self

PAYMENT_BATCH_ADAPTER: TypeAdapter[list[CreatePaymentRequest]] = TypeAdapter(
    Annotated[list[CreatePaymentRequest], Field(min_length=1, max_length=250)]
)

def parse_payment_batch_good(raw_json: bytes) -> list[CreatePaymentRequest]:
    return PAYMENT_BATCH_ADAPTER.validate_json(raw_json)
```

---

## 3. Domain Value Object Reuse via `Annotated` & `AfterValidator`

Define reusable type aliases with `typing.Annotated` and `pydantic.AfterValidator` rather than duplicating `@field_validator` methods across DTOs.
- **Outbound Serialization Security:** Never return ORM entities directly. Serialize via dedicated `Response` DTOs using `model_dump_json(by_alias=True, exclude_none=True)` and wrap secrets in `SecretStr`.
