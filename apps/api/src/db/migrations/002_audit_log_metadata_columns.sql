-- Migration 002: Add audit log metadata columns for RBAC and audit auditing.
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS role VARCHAR(50),
ADD COLUMN IF NOT EXISTS target_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS request_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS route VARCHAR(255),
ADD COLUMN IF NOT EXISTS metadata JSONB;
