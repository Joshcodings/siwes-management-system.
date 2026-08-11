const db = require('better-sqlite3')('siwes.db');

try {
  const tx = db.transaction(() => {
    // This simulates what the wrapper does:
    // async () => { ... }
    return (async () => {
      const res1 = db.prepare("UPDATE applications SET status = ? WHERE id = ?").run('APPROVED', 16);
      console.log('Update 1:', res1);
      
      const app = db.prepare("SELECT student_id, company_id FROM applications WHERE id = ?").get(16);
      console.log('App:', app);
      
      const res2 = db.prepare("UPDATE student_profiles SET assigned_company_id = ? WHERE user_id = ?").run(app.company_id, app.student_id);
      console.log('Update 2:', res2);
      
      const company = db.prepare("SELECT name FROM companies WHERE id = ?").get(app.company_id);
      console.log('Company:', company);
      
      const res3 = db.prepare(`DELETE FROM applications WHERE student_id = ? AND id != ? AND status IN ('PENDING', 'REJECTED')`).run(app.student_id, 16);
      console.log('Delete:', res3);
      
      const res4 = db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
        app.student_id,
        `✅ Your application to ${company?.name || 'a company'} has been approved! You are now officially placed. All your other pending applications have been automatically cleared.`
      );
      console.log('Insert:', res4);
    })();
  });
  
  tx().catch(err => console.error("Async Error inside tx:", err));
} catch (e) {
  console.error("Tx Error:", e);
}
