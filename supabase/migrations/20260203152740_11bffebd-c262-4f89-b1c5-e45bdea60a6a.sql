-- Add needs_review to the verification_verdict enum
ALTER TYPE verification_verdict ADD VALUE IF NOT EXISTS 'needs_review';