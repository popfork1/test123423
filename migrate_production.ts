import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = postgres(connectionString);

async function createTables() {
  try {
    console.log('Creating changelogs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "changelogs" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "version" varchar(20) NOT NULL UNIQUE,
        "title" varchar(200) NOT NULL,
        "description" text,
        "status" text NOT NULL,
        "changes" text NOT NULL,
        "date" varchar(50) NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Changelogs table created');

    console.log('Creating predictions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "predictions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "game_id" varchar NOT NULL,
        "voted_for" varchar(100) NOT NULL,
        "created_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Predictions table created');

    console.log('\n✓ All tables created successfully!');
    await sql.end();
  } catch (err) {
    console.error('Error creating tables:', err);
    await sql.end();
    process.exit(1);
  }
}

createTables();
