# Alert Lifecycle & Data Model

## Data Model
- \status\: ENUM (new, acknowledged, assigned, investigating, resolved)
- \ssignee_id\: UUID/String
- \cknowledged_at\, \investigating_at\, \esolved_at\: Timestamps
- \esolution_notes\: Text for RCA

## Lifecycle State Machine
1. **new**: Initial state.
2. **acknowledged**: Operator acknowledges.
3. **assigned**: Delegated to specific operator.
4. **investigating**: Active investigation.
5. **resolved**: Closed with notes.
6. **reopen**: Transition back to 'new'.
