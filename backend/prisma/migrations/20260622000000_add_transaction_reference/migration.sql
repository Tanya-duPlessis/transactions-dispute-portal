-- Add reference column to Transaction table
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "reference" TEXT;

-- Backfill existing rows with a unique reference
UPDATE "Transaction" SET "reference" = 'TXN-' || LPAD(FLOOR(RANDOM() * 99999999)::TEXT, 8, '0') || '-' || SUBSTRING(id::TEXT, 1, 4) WHERE "reference" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "reference" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "Transaction" ADD CONSTRAINT IF NOT EXISTS "Transaction_reference_key" UNIQUE ("reference");

-- Add index for reference search
CREATE INDEX IF NOT EXISTS "Transaction_reference_idx" ON "Transaction"("reference");
