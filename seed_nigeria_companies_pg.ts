import db from './src/db.js';
import { seedCompanies } from './src/companies_list.js';

async function seed() {
  try {
    console.log(`Starting migration to PostgreSQL / Neon: Clearing existing data...`);
    
    await db.transaction(async () => {
      await db.run("UPDATE student_profiles SET assigned_company_id = NULL");
      await db.run("DELETE FROM applications");
      await db.run("DELETE FROM logbook_entries");
      await db.run("DELETE FROM companies");
      
      console.log(`Inserting ${seedCompanies.length} real-world companies into database...`);
      for (const comp of seedCompanies) {
        await db.run(
          "INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius) VALUES (?, ?, ?, ?, ?, ?, ?, 500)",
          comp.name, comp.email, comp.industry_type, JSON.stringify(comp.skills), comp.address, comp.lat, comp.lon
        );
      }
    });

    const count = await db.get("SELECT COUNT(*) as count FROM companies");
    console.log(`✅ Success! Seeded ${count.count} companies in production database!`);
  } catch (e: any) {
    console.error(`❌ Seeding failed:`, e.message);
  }
}

seed();
