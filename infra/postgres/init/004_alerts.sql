-- Migration 004: Alerts
CREATE TABLE alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    asset_id UUID NOT NULL,
    asset_name VARCHAR(255),
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    assignee_id VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100),
    investigating_at TIMESTAMP WITH TIME ZONE,
    investigating_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100),
    resolution_notes TEXT
);

CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_status ON alerts(status) WHERE status != 'resolved';
