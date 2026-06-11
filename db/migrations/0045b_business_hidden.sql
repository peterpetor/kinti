-- DSA megfelelőség: Vállalkozások elrejtése jelentés esetén
ALTER TABLE businesses ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_businesses_hidden ON businesses (hidden);
