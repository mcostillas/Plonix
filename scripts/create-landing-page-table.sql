-- Create table for landing page content management
CREATE TABLE IF NOT EXISTS landing_page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_landing_page_updated_at ON landing_page_content(updated_at DESC);

-- Add comment
COMMENT ON TABLE landing_page_content IS 'Stores editable landing page content managed through admin panel';

-- Insert default content
INSERT INTO landing_page_content (content) VALUES (
  '{
    "hero": {
      "title": "Master Your Money with AI-Powered Guidance",
      "subtitle": "Plounix helps Filipino students and young professionals budget, save, and invest smarter with personalized AI financial coaching.",
      "cta_text": "Get Started Free",
      "cta_link": "/auth/signup"
    },
    "features": [
      {
        "title": "AI Financial Assistant",
        "description": "Get instant answers to your money questions from Fili, your personal AI financial coach.",
        "icon": "Brain"
      },
      {
        "title": "Smart Budgeting",
        "description": "Track expenses and create budgets that work with the 50-30-20 rule designed for Filipino income levels.",
        "icon": "Calculator"
      },
      {
        "title": "Goal Tracking",
        "description": "Set and achieve financial goals - from emergency funds to dream vacations.",
        "icon": "Target"
      },
      {
        "title": "Money Challenges",
        "description": "Join fun saving challenges and build better financial habits with gamification.",
        "icon": "Trophy"
      }
    ],
    "testimonials": [
      {
        "name": "Maria Santos",
        "role": "College Student",
        "content": "Plounix helped me save ₱15,000 in just 3 months! The AI assistant makes budgeting so easy."
      },
      {
        "name": "Juan dela Cruz",
        "role": "Young Professional",
        "content": "Finally understanding where my money goes. The insights are game-changing!"
      }
    ],
    "stats": [
      { "label": "Active Users", "value": "10,000+" },
      { "label": "Money Saved", "value": "₱50M+" },
      { "label": "Goals Achieved", "value": "25,000+" },
      { "label": "User Rating", "value": "4.9/5" }
    ]
  }'::jsonb
)
ON CONFLICT DO NOTHING;
