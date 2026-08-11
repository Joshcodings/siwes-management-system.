import Database from 'better-sqlite3';
import pg from 'pg';

const PG_URL = 'postgresql://neondb_owner:npg_XS4LNVxji2bF@ep-summer-fog-aqn7blof.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Sleep helper
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Get a fresh client each time to avoid stale connections
async function getClient() {
  const client = new pg.Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

async function syncUsers() {
  const localDb = new Database('siwes.db');

  console.log('Fetching users from local SQLite...');
  const localUsers = localDb.prepare('SELECT * FROM users').all() as any[];
  console.log(`Found ${localUsers.length} users locally.\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const user of localUsers) {
    let client: pg.Client | null = null;
    let retries = 3;

    while (retries > 0) {
      try {
        client = await getClient();

        // Check if user already exists
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);

        if (existing.rows.length > 0) {
          // Update role and credentials if different
          await client.query(
            'UPDATE users SET full_name = $1, role = $2, password = $3 WHERE email = $4',
            [user.full_name, user.role, user.password, user.email]
          );
          console.log(`  ✔ Updated existing user: "${user.email}" (${user.role})`);
          skipCount++;
        } else {
          // Insert new user
          const insertRes = await client.query(
            'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [user.email, user.password, user.full_name, user.role]
          );
          const newId = insertRes.rows[0].id;
          console.log(`  + Inserted: "${user.email}" as ${user.role}`);
          successCount++;

          // Also copy student profile if applicable
          if (user.role === 'STUDENT') {
            const profile = localDb.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id) as any;
            if (profile) {
              await client.query(
                `INSERT INTO student_profiles 
                (user_id, mat_number, course, department, skills, location_preference, latitude, longitude, cgpa, cv_url, total_weeks)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (user_id) DO NOTHING`,
                [
                  newId,
                  profile.mat_number || null,
                  profile.course || 'Unspecified',
                  profile.department || 'Unspecified',
                  profile.skills || '[]',
                  profile.location_preference || null,
                  profile.latitude || null,
                  profile.longitude || null,
                  profile.cgpa || null,
                  profile.cv_url || null,
                  profile.total_weeks || 24
                ]
              );
              console.log(`    ➔ Profile synced for "${user.email}"`);
            }
          }
        }

        await client.end();
        client = null;
        break; // success — move to next user

      } catch (e: any) {
        retries--;
        if (client) { try { await client.end(); } catch {} client = null; }
        if (retries === 0) {
          console.error(`  ❌ Failed to sync "${user.email}" after 3 attempts: ${e.message}`);
          errorCount++;
        } else {
          console.log(`  ⚠ Connection error for "${user.email}", retrying (${retries} left)...`);
          await sleep(2000); // wait 2 seconds before retry
        }
      }
    }

    await sleep(200); // small delay between users to prevent connection flooding
  }

  localDb.close();

  console.log(`\n============================`);
  console.log(`✅ Sync complete!`);
  console.log(`   Inserted:  ${successCount} new users`);
  console.log(`   Updated:   ${skipCount} existing users`);
  console.log(`   Failed:    ${errorCount} users`);
  console.log(`============================`);
}

syncUsers();
