CREATE TABLE IF NOT EXISTS redeem_codes (

    id SERIAL PRIMARY KEY,

    code TEXT UNIQUE NOT NULL,

    reward BIGINT NOT NULL,

    created_by TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    active BOOLEAN DEFAULT TRUE

);



CREATE TABLE IF NOT EXISTS redeem_history (

    id SERIAL PRIMARY KEY,

    discord_id TEXT NOT NULL,

    code TEXT NOT NULL,

    reward BIGINT NOT NULL,

    redeemed_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(discord_id,code)

);