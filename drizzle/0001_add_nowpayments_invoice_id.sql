-- Add nowpayments_invoice_id column to transactions table
ALTER TABLE "transactions"
ADD COLUMN "nowpayments_invoice_id" text;
