---
name: ProtocolAndWireFormatAnalysis
desc: Reverse Engineering Proprietary Binary Network Protocols, TLV Structures, and Custom Serializers for Interoperability
rules: [R_CORE, R_SEC, R_REVERSE]
category: Reversing
---
# 📡 Proprietary Protocol & Wire-Format Reversing Protocol

**Goal:** Reconstruct undocumented binary network protocols, custom serialization formats, and Type-Length-Value (TLV) message frames from packet captures and binary decompilation, authoring Wireshark Lua dissectors and schema definitions for clean-room interoperability.

---

## 1. Protocol Reverse Engineering Methodology

```text
  [Raw Packet Captures: PCAP / TLS MITM]
                    │
                    ▼
┌───────────────────────────────────────────┐
│ 1. FRAME DELIMITATION & HEADER DISCOVERY  │
│    • Magic byte preamble (e.g., 0x55AA)   │
│    • Message length field (Big vs Little) │
│    • Opcode / Command ID                  │
│    • Sequence counter & Checksum (CRC/MD5)│
└───────────────────┬───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│ 2. PAYLOAD STRUCT RECONSTRUCTION          │
│    • Fixed-offset structs vs TLV arrays   │
│    • Varint / ZigZag encoding detection   │
│    • Binary diff across client actions    │
└───────────────────┬───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│ 3. DISSECTOR & SCHEMA AUTHORING           │
│    • Wireshark Lua Dissector plugin       │
│    • Clean-room Kaitai Struct / Protobuf  │
└───────────────────────────────────────────┘
```

---

## 2. Structural Field Recognition Patterns

| Protocol Field | Common Representation | How to Identify |
| :--- | :--- | :--- |
| **Magic Header** | 2–4 fixed bytes (`0xDEADBEEF`, `0xAA55`) | Identical across all outgoing and incoming packets. |
| **Payload Length**| 2 or 4-byte integer (uint16/uint32) | Value correlates with `packet_size - header_size`. |
| **Opcode** | 1, 2, or 4-byte enum | Changes systematically when different actions are triggered in client. |
| **Sequence Number**| 2 or 4-byte counter | Increments by 1 on each transmitted frame. |
| **Checksum / CRC** | 2-byte (CRC16) or 4-byte (CRC32) at frame tail | Modifying any bit in payload causes the server to immediately drop or close connection. |
| **Varint (Protobuf)**| MSB continuation bit (`byte & 0x80`) | High bit is 1 for multi-byte values, 0 for terminating byte. |

---

## 3. Wireshark Lua Dissector Template

Convert reverse-engineered protocol specifications into an executable Wireshark dissector for live packet inspection:

```lua
-- Custom Binary Protocol Dissector (custom_proto.lua)
local custom_proto = Proto("custom_proto", "Custom Proprietary Protocol")

local f_magic   = ProtoField.uint16("custom_proto.magic", "Magic Bytes", base.HEX)
local f_length  = ProtoField.uint16("custom_proto.length", "Payload Length", base.DEC)
local f_opcode  = ProtoField.uint16("custom_proto.opcode", "Opcode", base.HEX, {
    [0x0100] = "LOGIN_REQUEST",
    [0x0101] = "LOGIN_RESPONSE",
    [0x0200] = "HEARTBEAT_PING",
    [0x0201] = "HEARTBEAT_PONG",
    [0x0300] = "DATA_SYNC"
})
local f_seq     = ProtoField.uint32("custom_proto.seq", "Sequence ID", base.DEC)
local f_payload = ProtoField.bytes("custom_proto.payload", "Payload Data")
local f_crc     = ProtoField.uint16("custom_proto.crc", "CRC16 Checksum", base.HEX)

custom_proto.fields = { f_magic, f_length, f_opcode, f_seq, f_payload, f_crc }

function custom_proto.dissector(buffer, pinfo, tree)
    local length = buffer:len()
    if length < 12 then return end -- Header(10) + CRC(2)

    pinfo.cols.protocol = "CUSTOM_PROTO"
    local subtree = tree:add(custom_proto, buffer(), "Custom Protocol Data")
    
    subtree:add(f_magic,   buffer(0, 2))
    subtree:add(f_length,  buffer(2, 2))
    subtree:add(f_opcode,  buffer(4, 2))
    subtree:add(f_seq,     buffer(6, 4))
    
    local payload_len = buffer(2, 2):uint()
    if length >= (10 + payload_len + 2) then
        subtree:add(f_payload, buffer(10, payload_len))
        subtree:add(f_crc,     buffer(10 + payload_len, 2))
    end
end

-- Bind to custom TCP port
local tcp_port = DissectorTable.get("tcp.port")
tcp_port:add(9876, custom_proto)
```

---

## 4. Protobuf Schema-Less Payload Recovery

When reversing applications that communicate via compiled Protobuf where `.proto` definition files are missing:

1. **Extract Raw Wire Format**:
   - Save the raw byte buffer to `payload.bin`.
2. **Decode Wire Structure via `protoc`**:
   ```bash
   protoc --decode_raw < payload.bin
   ```
   *Sample Output:*
   ```text
   1: "player_agent_01"
   2: 42
   3 {
     1: 172.500000
     2: 89.200000
   }
   ```
3. **Reconstruct `.proto` Specification**:
   - Field 1 = string (`username`)
   - Field 2 = uint32 (`level` or `id`)
   - Field 3 = sub-message (`coordinates` with float fields `x` and `y`)

---

## 5. Verification & Audit Checklist
- [ ] Multiple independent sessions captured to verify field offset consistency.
- [ ] Endianness (Little-Endian vs Big-Endian) validated against multi-byte fields.
- [ ] Checksum algorithm validated by reproducing calculated CRC value across 10+ captured samples.
