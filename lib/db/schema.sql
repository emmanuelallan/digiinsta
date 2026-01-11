-- DigiInsta Neon PostgreSQL Schema
-- Transactional data for orders, analytics, sessions, and creator reports

-- Orders table (from Polar webhooks)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  polar_order_id VARCHAR(255) UNIQUE NOT NULL,
  polar_checkout_id VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount INTEGER NOT NULL, -- cents
  currency VARCHAR(10) DEFAULT 'usd',
  fulfilled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items with creator attribution
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL, -- 'product' or 'bundle'
  sanity_id VARCHAR(255) NOT NULL, -- Sanity document ID
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL, -- cents
  creator_sanity_id VARCHAR(255), -- Creator's Sanity ID for revenue tracking
  file_key VARCHAR(255), -- R2 file key
  max_downloads INTEGER DEFAULT 5,
  downloads_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'add_to_cart', 'purchase'
  sanity_id VARCHAR(255) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin sessions (OTP-based)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  session_token VARCHAR(255) UNIQUE,
  session_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Creator report tokens
CREATE TABLE IF NOT EXISTS creator_report_tokens (
  id SERIAL PRIMARY KEY,
  creator_sanity_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_sanity_id ON order_items(sanity_id);
CREATE INDEX IF NOT EXISTS idx_order_items_creator ON order_items(creator_sanity_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sanity_id ON analytics_events(sanity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_creator_tokens_token ON creator_report_tokens(token);
CREATE INDEX IF NOT EXISTS idx_creator_tokens_creator ON creator_report_tokens(creator_sanity_id);
