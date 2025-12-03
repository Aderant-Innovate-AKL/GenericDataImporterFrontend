--
-- PostgreSQL database dump
-- Database: cash_receipts_db
-- Generated from: cash_receipts.csv
-- Date: 2025-12-04
--

-- Connect to your database before running this script
-- Example: \c your_database_name

-- Drop table if exists (uncomment if needed)
-- DROP TABLE IF EXISTS cash_receipts CASCADE;

--
-- Table structure for table cash_receipts
--

CREATE TABLE IF NOT EXISTS cash_receipts (
    transaction_id INTEGER PRIMARY KEY,
    deposit_id INTEGER NOT NULL,
    receipt_id INTEGER NOT NULL,
    bank_id VARCHAR(10) NOT NULL,
    payor_type VARCHAR(20) NOT NULL,
    payor_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date_modified DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Indexes for table cash_receipts
--

CREATE INDEX IF NOT EXISTS idx_cash_receipts_deposit_id ON cash_receipts(deposit_id);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_receipt_id ON cash_receipts(receipt_id);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_bank_id ON cash_receipts(bank_id);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_payor_type ON cash_receipts(payor_type);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_payor_id ON cash_receipts(payor_id);
CREATE INDEX IF NOT EXISTS idx_cash_receipts_date_modified ON cash_receipts(date_modified);

--
-- Dumping data for table cash_receipts
--

BEGIN;

INSERT INTO cash_receipts (transaction_id, deposit_id, receipt_id, bank_id, payor_type, payor_id, amount, date_modified) VALUES
(1, 3, 1, 'BONZ', 'Client', 8134, 123.45, '2025-10-12'),
(3, 6, 2, 'BONZ', 'Vendor', 123, 213.78, '2025-10-12'),
(4, 23, 3, 'BOA', 'Vendor', 124, 1239.65, '2023-10-14'),
(6, 23, 4, 'BOT', 'Employee', 4573, 1.90, '2022-03-23'),
(9, 23, 5, 'BOA', 'Vendor', 3468, 23.11, '2019-02-29'),
(10, 17, 6, 'BOT', 'Client', 94, 213454.43, '2015-03-03'),
(11, 17, 7, 'BOT', 'Client', 43, 10.00, '2018-09-23'),
(16, 40, 8, 'BOJ', 'Vendor', 432, 974.20, '2023-02-01'),
(19, 41, 9, 'BOJ', 'Vendor', 124, 123.00, '2025-10-12'),
(23, 42, 10, 'BOJ', 'Misc', 9001, 583.58, '2010-10-10'),
(24, 45, 11, 'BONZ', 'Client', 8135, 456.78, '2024-11-15'),
(25, 46, 12, 'BOA', 'Vendor', 125, 789.23, '2023-12-18'),
(27, 48, 13, 'BOT', 'Employee', 4574, 2500.00, '2024-04-05'),
(28, 49, 14, 'BOJ', 'Client', 8136, 1567.89, '2025-06-22'),
(30, 50, 15, 'BONZ', 'Vendor', 3469, 345.67, '2024-07-08'),
(31, 51, 16, 'BOA', 'Client', 95, 12345.00, '2023-08-14'),
(33, 53, 17, 'BOT', 'Misc', 9002, 78.90, '2022-09-19'),
(35, 55, 18, 'BOJ', 'Employee', 4575, 3200.50, '2024-10-25'),
(36, 56, 19, 'BONZ', 'Vendor', 126, 890.45, '2023-11-03'),
(38, 58, 20, 'BOA', 'Client', 8137, 4567.12, '2025-01-12'),
(40, 60, 21, 'BOT', 'Vendor', 433, 234.56, '2024-02-07'),
(41, 61, 22, 'BOJ', 'Client', 96, 8901.23, '2023-03-16'),
(43, 63, 23, 'BONZ', 'Employee', 4576, 1850.00, '2024-04-21'),
(44, 64, 24, 'BOA', 'Misc', 9003, 567.89, '2022-05-28'),
(46, 66, 25, 'BOT', 'Vendor', 127, 1234.56, '2025-06-04'),
(48, 68, 26, 'BOJ', 'Client', 8138, 3456.78, '2023-07-11'),
(49, 69, 27, 'BONZ', 'Vendor', 3470, 678.90, '2024-08-18'),
(51, 71, 28, 'BOA', 'Employee', 4577, 2900.00, '2022-09-24'),
(52, 72, 29, 'BOT', 'Client', 97, 15678.90, '2025-10-02'),
(54, 74, 30, 'BOJ', 'Vendor', 128, 345.12, '2023-11-09'),
(56, 76, 31, 'BONZ', 'Misc', 9004, 890.23, '2024-12-15'),
(57, 77, 32, 'BOA', 'Client', 8139, 2345.67, '2024-01-22'),
(59, 79, 33, 'BOT', 'Vendor', 434, 456.78, '2023-02-28'),
(60, 80, 34, 'BOJ', 'Employee', 4578, 3100.00, '2025-03-06'),
(62, 82, 35, 'BONZ', 'Client', 98, 23456.78, '2024-04-13'),
(64, 84, 36, 'BOA', 'Vendor', 129, 567.89, '2023-05-19'),
(65, 85, 37, 'BOT', 'Client', 8140, 6789.01, '2022-06-26'),
(67, 87, 38, 'BOJ', 'Misc', 9005, 123.45, '2025-07-03'),
(69, 89, 39, 'BONZ', 'Vendor', 3471, 789.12, '2024-08-10'),
(70, 90, 40, 'BOA', 'Employee', 4579, 2750.00, '2023-09-16'),
(72, 92, 41, 'BOT', 'Client', 99, 18901.23, '2024-10-23'),
(73, 93, 42, 'BOJ', 'Vendor', 130, 234.56, '2022-11-30'),
(75, 95, 43, 'BONZ', 'Client', 8141, 4567.89, '2025-12-07'),
(77, 97, 44, 'BOA', 'Vendor', 435, 890.12, '2024-01-14'),
(78, 98, 45, 'BOT', 'Employee', 4580, 3300.00, '2023-02-20'),
(80, 100, 46, 'BOJ', 'Misc', 9006, 456.78, '2025-03-28'),
(81, 101, 47, 'BONZ', 'Client', 100, 34567.89, '2024-04-05'),
(83, 103, 48, 'BOA', 'Vendor', 131, 678.90, '2023-05-12'),
(85, 105, 49, 'BOT', 'Client', 8142, 5678.90, '2022-06-18'),
(86, 106, 50, 'BOJ', 'Employee', 4581, 2850.00, '2025-07-25');

COMMIT;

--
-- Constraints for table cash_receipts
--

ALTER TABLE cash_receipts
    ADD CONSTRAINT chk_payor_type CHECK (payor_type IN ('Client', 'Vendor', 'Employee', 'Misc'));

ALTER TABLE cash_receipts
    ADD CONSTRAINT chk_amount_positive CHECK (amount >= 0);

--
-- Create trigger for updated_at timestamp
--

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cash_receipts_updated_at
    BEFORE UPDATE ON cash_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

--
-- Summary Statistics View (Optional)
--

CREATE OR REPLACE VIEW cash_receipts_summary AS
SELECT
    bank_id,
    payor_type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS average_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount
FROM cash_receipts
GROUP BY bank_id, payor_type
ORDER BY bank_id, payor_type;

--
-- Grant permissions (adjust as needed)
--

-- GRANT SELECT, INSERT, UPDATE, DELETE ON cash_receipts TO your_user;
-- GRANT SELECT ON cash_receipts_summary TO your_user;

--
-- PostgreSQL database dump complete
--
