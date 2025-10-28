-- Create table for resource management
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  topics TEXT[], -- Array of topics
  services TEXT[], -- Array of services
  additional_info JSONB, -- For flexible additional data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);

-- Add comment
COMMENT ON TABLE resources IS 'Stores resources for the resource hub page managed through admin panel';

-- Insert default resources from current data
INSERT INTO resources (name, url, type, category, description, topics) VALUES
-- Filipino Educators
('Peso Sense', 'https://www.youtube.com/@pesosense4306', 'YouTube Channel', 'Financial Education', 'Comprehensive financial education in Filipino context', ARRAY['Budgeting', 'Investing', 'Personal Finance', 'Philippine Market']),
('Nicole Alba', 'https://www.youtube.com/results?search_query=nicole+alba', 'YouTube Content', 'Financial Education', 'Personal finance tips and money management strategies', ARRAY['Personal Finance', 'Budgeting', 'Saving Strategies']),
('Chinkee Tan (Chink Positive)', 'https://www.youtube.com/@chinkpositive', 'YouTube Channel & Blog', 'Financial Motivation', 'Motivational financial content and wealth mindset', ARRAY['Financial Mindset', 'Wealth Building', 'Money Psychology']),

-- Philippine Banks
('BPI (Bank of the Philippine Islands)', 'https://www.bpi.com.ph/', 'Banking Institution', 'Traditional Banking', 'Leading Philippine bank with comprehensive financial services', ARRAY['Savings Accounts', 'Credit Cards', 'Loans', 'Investment Products']),
('Metrobank', 'https://www.metrobank.com.ph/home', 'Banking Institution', 'Traditional Banking', 'Major Philippine bank offering diverse financial products', ARRAY['Personal Banking', 'Business Banking', 'Investment Banking']),
('BDO (Banco de Oro)', 'https://www.bdo.com.ph/', 'Banking Institution', 'Traditional Banking', 'Largest bank in the Philippines by assets', ARRAY['Savings', 'Loans', 'Credit Cards', 'Remittances']),

-- Digital Platforms
('GCash', 'https://www.gcash.com/', 'Digital Wallet', 'Fintech', 'Leading Philippine mobile wallet and financial services app', ARRAY['Mobile Payments', 'Bills Payment', 'Money Transfer', 'Savings', 'Investments']),
('Maya (formerly PayMaya)', 'https://www.mayabank.ph/', 'Digital Bank', 'Fintech', 'Digital bank offering comprehensive online financial services', ARRAY['Digital Banking', 'Savings', 'Credit', 'Payments']),
('COL Financial', 'https://www.colfinancial.com/ape/Final2/home/HOME_NL_MAIN.asp?p=0', 'Online Brokerage', 'Investment Platform', 'Leading online stock brokerage in the Philippines', ARRAY['Stock Trading', 'Mutual Funds', 'UITFs', 'Investment Education']),

-- Government Agencies
('Bangko Sentral ng Pilipinas (BSP)', 'https://www.bsp.gov.ph/SitePages/Default.aspx', 'Central Bank', 'Government Regulatory', 'Central bank of the Philippines regulating financial institutions', ARRAY['Monetary Policy', 'Financial Supervision', 'Consumer Protection']),
('Securities and Exchange Commission (SEC)', 'https://www.sec.gov.ph/#gsc.tab=0', 'Regulatory Agency', 'Government Regulatory', 'Regulates securities market and protects investors', ARRAY['Securities Regulation', 'Corporate Registration', 'Investor Protection']),
('Philippine Deposit Insurance Corporation (PDIC)', 'https://www.pdic.gov.ph/', 'Government Corporation', 'Deposit Insurance', 'Protects depositors and maintains stability in the banking system', ARRAY['Deposit Insurance', 'Bank Resolution', 'Financial Consumer Protection']),
('Department of Finance (DOF)', 'https://www.dof.gov.ph/', 'Government Department', 'Public Finance', 'Manages government finances and economic policies', ARRAY['Tax Policy', 'Public Finance Management', 'Economic Policy']),

-- International Resources
('Khan Academy - Financial Literacy', 'https://www.khanacademy.org/college-careers-more/financial-literacy', 'Educational Platform', 'Online Learning', 'Free comprehensive financial literacy courses', ARRAY['Budgeting', 'Saving', 'Credit', 'Investing'])

ON CONFLICT DO NOTHING;
