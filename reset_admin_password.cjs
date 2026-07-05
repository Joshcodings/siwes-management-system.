const db = require('better-sqlite3')('siwes.db');
const bcrypt = require('bcryptjs');

try {
  const superAdmin = db.prepare("SELECT * FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1").get();
  if (superAdmin) {
    const plainPassword = 'adminpassword';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, superAdmin.id);
    console.log(`SUPER ADMIN CREDENTIALS:`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Password: ${plainPassword}`);
  } else {
    console.log("No SUPER_ADMIN found in the database!");
  }
} catch (e) {
  console.error("Error:", e.message);
}
