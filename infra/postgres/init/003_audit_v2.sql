-- Migration 003: Audit Outbox V2
CREATE TABLE audit_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_audit_outbox_status ON audit_outbox(status);
