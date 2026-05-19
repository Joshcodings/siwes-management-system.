import db from './src/db.js';
import { seedCompanies } from './src/companies_list.js';

async function seed() {
  try {
    console.log(`Starting migration to PostgreSQL / Neon: Clearing existing data...`);
    
    await db.run("UPDATE student_profiles SET assigned_company_id = NULL");
    await db.run("DELETE FROM applications");
    await db.run("DELETE FROM logbook_entries");
    await db.run("DELETE FROM companies");
    
    console.log(`Inserting ${seedCompanies.length} real-world companies into database in batches...`);
    
    // Batch inserts to prevent network overhead and avoid ECONNRESET
    const batchSize = 25;
    for (let i = 0; i < seedCompanies.length; i += batchSize) {
      const batch = seedCompanies.slice(i, i + batchSize);
      
      // Build placeholders compatible with both SQLite and Postgres adapter translation
      const placeholders = batch.map(() => `(?, ?, ?, ?, ?, ?, ?, 500)`).join(', ');
      
      const query = `
        INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius)
        VALUES ${placeholders}
      `;
      
      // Build values array
      const values: any[] = [];
      for (const comp of batch) {
        values.push(
          comp.name,
          comp.email,
          comp.industry_type,
          JSON.stringify(comp.skills),
          comp.address,
          comp.lat,
          comp.lon
        );
      }
      
      await db.run(query, ...values);
      console.log(`Seeded batch ${Math.floor(i / batchSize) + 1} (${batch.length} companies)`);
    }

    const count = await db.get("SELECT COUNT(*) as count FROM companies");
    console.log(`✅ Success! Seeded ${count.count} companies in production database!`);
  } catch (e: any) {
    console.error(`❌ Seeding failed:`, e.message);
  }
}

seed();
