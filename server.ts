import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db, { initDb } from "./src/db";
import { fileURLToPath } from "url";
import path from "path";
import { spawnSync, spawn } from "child_process";
import multer from "multer";
import nodemailer from "nodemailer";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || "siwes-super-secret-jwt-key-2025";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  initDb();
  const app = express();

  // --- SECURITY MIDDLEWARE ---
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.APP_URL || true, credentials: true }));

  const isProduction = process.env.NODE_ENV === 'production';

  // Rate limiting — ONLY active in production. Skipped entirely in development.
  if (isProduction) {
    // General API limit
    app.use('/api/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." }
    }));

    // Strict auth limit — prevents brute-force in production
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { error: "Too many login attempts. Please wait 15 minutes." }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);
  }


  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- AI SCORING LOGIC ---
  function calculateScore(student: any, company: any) {
    try {
      const studentSkills = Array.isArray(student.skills) ? student.skills : JSON.parse(student.skills || "[]");
      const companySkills = Array.isArray(company.required_skills) ? company.required_skills : JSON.parse(company.required_skills || "[]");

      // Skill overlap (0-60)
      const matchedSkills = studentSkills.filter((s: string) => companySkills.some((cs: string) => cs.toLowerCase() === s.toLowerCase()));
      const skillScore = companySkills.length > 0
        ? Math.min(60, (matchedSkills.length / companySkills.length) * 60)
        : 30; // Default if no skills listed

      // Course relevance (0-30)
      let courseScore = 10;
      if (student.course && company.industry_type) {
        const studentCourse = student.course.toLowerCase();
        const industry = company.industry_type.toLowerCase();
        if (studentCourse.includes(industry) || industry.includes(studentCourse) || 
            studentCourse.split(" ").some(k => k.length > 3 && industry.includes(k))) {
          courseScore = 30;
        }
      }

      // Location proximity (0-10)
      const locationMatch = (student.location_preference && company.address) ? 
        (student.location_preference.toLowerCase().includes(company.address.toLowerCase()) || 
         company.address.toLowerCase().includes(student.location_preference.toLowerCase())) : false;
      const locationScore = locationMatch ? 10 : 5;

      const total = skillScore + courseScore + locationScore;
      return {
        total,
        reason: matchedSkills.length > 0 ? `Matches ${matchedSkills.length} of your skills.` : "General relevance to your profile.",
        breakdown: {
          skillMatch: skillScore,
          courseMatch: courseScore,
          locationMatch: locationScore
        }
      };
    } catch (e) {
      console.error("Score calculation error:", e);
      return { total: 10, reason: "Match based on general criteria", breakdown: { skillMatch: 5, courseMatch: 3, locationMatch: 2 } };
    }
  }

  // --- GEOFENCING LOGIC ---
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", (req, res) => {
    const { email, password, fullName, matNumber } = req.body;
    const role = 'STUDENT'; // Force student role based on new requirement
    
    // Validate matric number format LCU/UG/YY/NNNNN
    const matRegex = /^LCU\/UG\/\d{2}\/\d+$/i;
    if (!matNumber || !matRegex.test(matNumber)) {
      return res.status(400).json({ error: "Invalid Matriculation Number format. Expected format: LCU/UG/YY/NNNNN" });
    }

    const formattedMat = matNumber.trim().toUpperCase();
    
    // Check if matric number is already in use
    const existingMat = db.prepare("SELECT user_id FROM student_profiles WHERE mat_number = ?").get(formattedMat);
    if (existingMat) {
      return res.status(400).json({ error: `Matriculation number ${formattedMat} is already in use.` });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)").run(email, hashedPassword, fullName, role);
      const userId = result.lastInsertRowid;

      db.prepare("INSERT INTO student_profiles (user_id, course, department, mat_number) VALUES (?, ?, ?, ?)").run(userId, "Unspecified", "Unspecified", formattedMat);

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/seed", (req, res) => {
    try {
      const companies = [
        { name: "Paystack", email: "careers@paystack.com", industry_type: "FinTech", required_skills: "[\"React\", \"Node.js\", \"TypeScript\", \"Go\", \"SQL\"]", address: "Ikeja, Lagos", latitude: 6.6018, longitude: 3.3515, allowed_radius: 500 },
        { name: "Flutterwave", email: "hr@flutterwavego.com", industry_type: "FinTech", required_skills: "[\"Java\", \"Spring Boot\", \"React\", \"Cybersecurity\", \"Python\"]", address: "Lekki, Lagos", latitude: 6.4382, longitude: 3.4905, allowed_radius: 500 },
        { name: "Andela", email: "jobs@andela.com", industry_type: "Software Development", required_skills: "[\"React\", \"Python\", \"Django\", \"AWS\", \"Communication\"]", address: "Lagos", latitude: 6.5244, longitude: 3.3792, allowed_radius: 1000 },
        { name: "MTN Nigeria", email: "careers.ng@mtn.com", industry_type: "Telecommunications", required_skills: "[\"Networking\", \"Linux\", \"Telecommunications\", \"Data Analysis\", \"Project Management\"]", address: "Ikoyi, Lagos", latitude: 6.4526, longitude: 3.4293, allowed_radius: 400 },
        { name: "Interswitch", email: "careers@interswitchgroup.com", industry_type: "FinTech", required_skills: "[\"C#\", \".NET\", \"SQL Server\", \"System Architecture\", \"Payment Systems\"]", address: "Victoria Island, Lagos", latitude: 6.4281, longitude: 3.4219, allowed_radius: 300 },
        { name: "Kuda Bank", email: "careers@kuda.com", industry_type: "Banking & Finance", required_skills: "[\"Kotlin\", \"Swift\", \"C#\", \"SQL\", \"Product Design\"]", address: "Yaba, Lagos", latitude: 6.5054, longitude: 3.3736, allowed_radius: 300 },
        { name: "PiggyVest", email: "careers@piggyvest.com", industry_type: "FinTech", required_skills: "[\"Node.js\", \"React\", \"MongoDB\", \"Marketing\", \"Customer Support\"]", address: "Victoria Island, Lagos", latitude: 6.4253, longitude: 3.4239, allowed_radius: 200 },
        { name: "Semicolon Africa", email: "hello@semicolon.africa", industry_type: "Education & Tech", required_skills: "[\"Java\", \"Python\", \"Design Thinking\", \"Problem Solving\", \"Web Development\"]", address: "Yaba, Lagos", latitude: 6.5070, longitude: 3.3740, allowed_radius: 300 },
        { name: "eTranzact", email: "hr@etranzact.com", industry_type: "Payment Systems", required_skills: "[\"Java\", \"Oracle\", \"Linux\", \"Cybersecurity\", \"Networking\"]", address: "Victoria Island, Lagos", latitude: 6.4312, longitude: 3.4300, allowed_radius: 400 },
        { name: "Seamfix", email: "careers@seamfix.com", industry_type: "Software Development", required_skills: "[\"Java\", \"React\", \"Android\", \"Data Analysis\", \"Biometrics\"]", address: "Lekki, Lagos", latitude: 6.4428, longitude: 3.4735, allowed_radius: 500 }
      ];
      db.prepare("UPDATE student_profiles SET assigned_company_id = NULL").run();
      db.prepare("DELETE FROM applications").run();
      db.prepare("DELETE FROM logbook_entries").run();
      db.prepare("DELETE FROM companies").run();
      const insert = db.prepare("INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      const transaction = db.transaction(() => {
        for (const comp of companies) {
          insert.run(comp.name, comp.email, comp.industry_type, comp.required_skills, comp.address, comp.latitude, comp.longitude, comp.allowed_radius);
        }
      });
      transaction();
      res.json({ success: true, count: companies.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  });

  // --- FORGOT PASSWORD ---
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }
    const { randomBytes } = await import("crypto");
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    db.prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);
    const resetLink = `${process.env.APP_URL || "http://localhost:3001"}?reset_token=${token}`;
    try {
      await transporter.sendMail({
        from: `"SIWES Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your SIWES Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #5A5A40;">Password Reset Request</h2>
            <p>Hi ${user.full_name},</p>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #5A5A40; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (e) {
      console.error("Email send error:", e);
    }
    res.json({ message: "If that email exists, a reset link has been sent." });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const record: any = db.prepare(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
    ).get(token);
    if (!record) return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, record.user_id);
    db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?").run(record.id);
    res.json({ message: "Password updated successfully. You can now log in." });
  });


  // NOTE: /api/notifications routes are registered after authenticate is defined below


  const ROLE_PERMISSIONS: Record<string, string[]> = {
    STUDENT: ["SUBMIT_LOGS", "VIEW_RECOMMENDATIONS", "MANAGE_PROFILE"],
    SCHOOL_SUPERVISOR: ["VIEW_ASSIGNED_STUDENTS", "APPROVE_LOGS", "GRADE_STUDENTS"],
    ADMIN: ["MANAGE_USERS", "MANAGE_COMPANIES", "VIEW_ALL_REPORTS", "VIEW_ALL_STUDENTS"]
  };

  // --- MIDDLEWARE ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const authorize = (permission: string) => {
    return (req: any, res: any, next: any) => {
      const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
      if (userPermissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
    };
  };

  // --- NOTIFICATIONS ---
  app.get("/api/notifications", authenticate, (req: any, res) => {
    const notifications = db.prepare(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    ).all(req.user.id);
    const unreadCount = (db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(req.user.id) as any).count;
    res.json({ notifications, unreadCount });
  });

  app.put("/api/notifications/read", authenticate, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  });

  // --- STUDENT ROUTES ---
  app.get("/api/student/profile", authenticate, (req: any, res) => {
    const profile = db.prepare(`
      SELECT sp.*, c.latitude as assigned_company_latitude, c.longitude as assigned_company_longitude 
      FROM student_profiles sp
      LEFT JOIN companies c ON sp.assigned_company_id = c.id
      WHERE sp.user_id = ?
    `).get(req.user.id) as any;
    res.json(profile || {});
  });

  app.put("/api/student/profile", authenticate, (req: any, res) => {
    try {
      const { course, department, skills, location_preference, latitude, longitude, cgpa, cv_url, mat_number } = req.body;
      
      if (!mat_number) {
        return res.status(400).json({ error: "Matriculation number is required" });
      }

      const formattedMatNumber = mat_number.trim().toUpperCase();
      const matRegex = /^LCU\/UG\/\d{2}\/\d+$/;
      if (!matRegex.test(formattedMatNumber)) {
        return res.status(400).json({ error: "Invalid Matriculation Number format. Expected format: LCU/UG/YY/NNNNN" });
      }

      // Check uniqueness: is there any OTHER user with this mat_number?
      const existing: any = db.prepare(`
        SELECT user_id FROM student_profiles 
        WHERE mat_number = ? AND user_id != ?
      `).get(formattedMatNumber, req.user.id);

      if (existing) {
        return res.status(400).json({ error: `Matriculation number ${formattedMatNumber} is already in use by another student.` });
      }

      db.prepare(`
        INSERT INTO student_profiles (user_id, course, department, skills, location_preference, latitude, longitude, cgpa, cv_url, mat_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          course = excluded.course,
          department = excluded.department,
          skills = excluded.skills,
          location_preference = excluded.location_preference,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          cgpa = excluded.cgpa,
          cv_url = excluded.cv_url,
          mat_number = excluded.mat_number
      `).run(req.user.id, course || '', department || '', JSON.stringify(skills || []), location_preference || '', 
        latitude || null, longitude || null, cgpa || null, cv_url || null, formattedMatNumber);
      
      res.json({ success: true });
    } catch (e: any) {
      console.error('PROFILE UPDATE ERROR:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // --- RECOMMENDATIONS ---
  app.get("/api/student/recommendations", authenticate, async (req: any, res) => {
    const student: any = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
    const companies: any = db.prepare("SELECT * FROM companies").all();

    if (!student) {
      return res.json([]);
    }

    // Parse JSON fields
    const studentData = {
      ...student,
      skills: JSON.parse(student.skills || "[]")
    };

    const companiesData = companies.map((c: any) => ({
      ...c,
      required_skills: JSON.parse(c.required_skills || "[]")
    }));

    // Helper: run python async with timeout (non-blocking)
    const runPythonAsync = (cmd: string, input: string, timeoutMs: number): Promise<any[] | null> => {
      return new Promise((resolve) => {
        let settled = false;
        const done = (result: any[] | null) => { if (!settled) { settled = true; resolve(result); } };

        const timer = setTimeout(() => done(null), timeoutMs);
        try {
          const proc = spawn(cmd, ["ai_engine.py", input], { timeout: timeoutMs });
          let stdout = '';
          proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
          proc.on('close', (code: number) => {
            clearTimeout(timer);
            if (code === 0 && stdout) {
              try {
                const parsed = JSON.parse(stdout.trim());
                done(Array.isArray(parsed) ? parsed : null);
              } catch { done(null); }
            } else { done(null); }
          });
          proc.on('error', () => { clearTimeout(timer); done(null); });
        } catch { done(null); }
      });
    };

    // Try Python AI Engine (async, non-blocking) with 6s timeout
    const input = JSON.stringify({ student: studentData, companies: companiesData });
    let pythonResult: any[] | null = null;
    for (const cmd of ["python", "python3"]) {
      pythonResult = await runPythonAsync(cmd, input, 6000);
      if (pythonResult) break;
    }

    if (pythonResult) {
      return res.json(pythonResult);
    }

    // Fallback: built-in JS scoring engine
    console.log("Python AI engine unavailable — using built-in JS scoring");
    const results = companiesData.map((company: any) => {
      const score = calculateScore(studentData, company);
      return { ...company, total: score.total, reason: score.reason, breakdown: score.breakdown };
    });
    results.sort((a: any, b: any) => b.total - a.total);
    res.json(results);
  });

  // --- AI CAREER ADVICE ---
  app.get("/api/student/career-advice", authenticate, (req: any, res) => {
    const student: any = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
    if (!student) {
      return res.json({ advice: "Please complete your profile to get personalized AI career advice." });
    }

    const skillsStr = (student.skills || "").toLowerCase();
    const courseStr = (student.course || "").toLowerCase();
    
    const isTechnical = skillsStr.includes('python') || skillsStr.includes('react') || skillsStr.includes('sql') || skillsStr.includes('java') || courseStr.includes('computer') || courseStr.includes('engineering') || courseStr.includes('science');
    
    let advice = "";
    
    if (isTechnical) {
      advice = `Based on your technical profile in **${student.course || 'your field'}**, you have two great paths:\n\n• **Large Industrial Companies**: Great for structure, learning enterprise-scale systems, and solidifying your foundational skills.\n• **Small Companies / Startups**: Fit your potential if you want hands-on experience across multiple domains, where you can learn a lot very quickly by taking on diverse responsibilities.\n\n**AI Recommendation**: A mid-sized to small firm might give you the best rapid learning curve for your specific technical skill set!`;
    } else {
      advice = `Looking at your background in **${student.course || 'your field'}**, here is your AI breakdown:\n\n• **Large Industrials / Corporations**: These will offer you excellent structured training programs and a clear understanding of corporate workflows.\n• **Small Companies**: These fit your potential if you are proactive and want to learn a lot by doing. You'll wear many hats and gain practical experience fast.\n\n**AI Recommendation**: Starting in a structured industrial environment might be more comfortable to build your initial confidence.`;
    }

    res.json({ advice });
  });

  // --- APPLICATIONS ---
  app.post("/api/student/apply", authenticate, (req: any, res) => {
    const { company_id, score, score_breakdown, custom_company } = req.body;
    try {
      let finalCompanyId = company_id;

      if (custom_company) {
        const result = db.prepare(`
          INSERT INTO companies (name, email, industry_type, address, latitude, longitude, required_skills)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(custom_company.name, custom_company.email || '', custom_company.industry_type, custom_company.address || '',
          custom_company.latitude || 0, custom_company.longitude || 0, '[]');
        finalCompanyId = result.lastInsertRowid;
      }

      if (!finalCompanyId) {
        return res.status(400).json({ error: "No company provided" });
      }

      // Check if already applied
      const existing = db.prepare("SELECT * FROM applications WHERE student_id = ? AND company_id = ?").get(req.user.id, finalCompanyId);
      if (existing) {
        return res.status(400).json({ error: "You have already applied to this company" });
      }

      db.prepare(`
        INSERT INTO applications (student_id, company_id, score, score_breakdown)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, finalCompanyId, score || 0, JSON.stringify(score_breakdown || {}));

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/student/applications", authenticate, (req: any, res) => {
    const apps = db.prepare(`
      SELECT a.*, c.name as company_name, c.industry_type, c.email as company_email, c.address as company_address
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `).all(req.user.id);
    res.json(apps);
  });

  app.post("/api/student/applications/:id/acceptance", authenticate, (req: any, res) => {
    const { acceptance_letter_url } = req.body;
    try {
      db.prepare(`
        UPDATE applications 
        SET acceptance_letter_url = ?, status = 'ACCEPTED_BY_COMPANY'
        WHERE id = ? AND student_id = ?
      `).run(acceptance_letter_url, req.params.id, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- LOGBOOK ---
  app.post("/api/upload", authenticate, upload.single('attachment'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  app.post("/api/student/register-workplace", authenticate, (req: any, res) => {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    try {
      const profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId);
      if (!profile) {
        db.prepare(`
          INSERT INTO student_profiles (user_id, course, department, internship_latitude, internship_longitude) 
          VALUES (?, 'General', 'Technology', ?, ?)
        `).run(userId, latitude, longitude);
      } else {
        db.prepare(`
          UPDATE student_profiles 
          SET internship_latitude = ?, internship_longitude = ? 
          WHERE user_id = ?
        `).run(latitude, longitude, userId);
      }
      res.json({ success: true, message: "Workplace registered" });
    } catch (e: any) {
      res.status(500).json({ error: "Server error", details: e.message });
    }
  });

  app.get("/api/student/location-requests", authenticate, (req: any, res) => {
    const reqs = db.prepare("SELECT * FROM location_change_requests WHERE student_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(reqs);
  });

  app.post("/api/student/location-request", authenticate, (req: any, res) => {
    const { reason } = req.body;
    const userId = req.user.id;
    try {
      // Check if already pending
      const existing = db.prepare("SELECT * FROM location_change_requests WHERE student_id = ? AND status = 'PENDING'").get(userId);
      if (existing) {
        return res.status(400).json({ error: "You already have a pending location change request." });
      }
      db.prepare("INSERT INTO location_change_requests (student_id, reason) VALUES (?, ?)").run(userId, reason);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });




  app.post("/api/logbook", authenticate, (req: any, res) => {
    const { activity_description, latitude, longitude, accuracy, date, attachment_url } = req.body;
    const student: any = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);

    if (!student.assigned_company_id) {
      return res.status(400).json({ error: "No company assigned" });
    }

    const company: any = db.prepare("SELECT * FROM companies WHERE id = ?").get(student.assigned_company_id);
    
    // Prioritize registered internship workplace coordinates, fallback to company address
    const targetLat = student.internship_latitude !== null ? student.internship_latitude : company.latitude;
    const targetLon = student.internship_longitude !== null ? student.internship_longitude : company.longitude;
    
    const distance = getDistance(latitude, longitude, targetLat, targetLon);
    const accuracyAdjustment = Math.min(accuracy || 0, 500); // Allow up to 500m fallback error tolerance
    const status = (distance - accuracyAdjustment) <= company.allowed_radius ? 'VERIFIED' : 'FLAGGED';

    db.prepare(`
      INSERT INTO logbook_entries (student_id, company_id, date, activity_description, latitude, longitude, verification_status, distance_from_company, attachment_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, student.assigned_company_id, date, activity_description, latitude, longitude, status, distance, attachment_url || null);


    // Notify supervisor in-app
    if (student.school_supervisor_id) {
      const studentUser: any = db.prepare("SELECT full_name FROM users WHERE id = ?").get(req.user.id);
      db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
        student.school_supervisor_id,
        `📋 ${studentUser?.full_name} submitted a new logbook entry for ${date}.`
      );

      // Also send email to supervisor
      const sup: any = db.prepare("SELECT email FROM users WHERE id = ?").get(student.school_supervisor_id);
      if (sup) {
        transporter.sendMail({
          from: `"SIWES Portal" <${process.env.EMAIL_USER}>`,
          to: sup.email,
          subject: `New Logbook Entry from ${studentUser?.full_name}`,
          html: `<p>Hi,<br><strong>${studentUser?.full_name}</strong> submitted a new logbook entry for <strong>${date}</strong>.<br>Activity: ${activity_description}<br>GPS Status: <strong>${status}</strong></p>`
        }).catch(() => {});
      }
    }

    res.json({ success: true, status, distance });
  });

  app.get("/api/logbook", authenticate, (req: any, res) => {
    const entries = db.prepare("SELECT * FROM logbook_entries WHERE student_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(entries);
  });

  // --- ADMIN / SUPERVISOR ROUTES ---
  app.get("/api/admin/analytics", authenticate, authorize("VIEW_ALL_STUDENTS"), (req: any, res) => {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'").get() as any;
    const totalPlacements = db.prepare("SELECT COUNT(*) as count FROM student_profiles WHERE assigned_company_id IS NOT NULL").get() as any;
    const verifiedLogs = db.prepare("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'VERIFIED'").get() as any;
    const flaggedLogs = db.prepare("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'FLAGGED'").get() as any;
    const pendingLogs = db.prepare("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'PENDING'").get() as any;
    const activeSupervisors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SCHOOL_SUPERVISOR'").get() as any;
    const totalCompanies = db.prepare("SELECT COUNT(*) as count FROM companies").get() as any;
    const pendingApplications = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'PENDING'").get() as any;
    const totalLogs = db.prepare("SELECT COUNT(*) as count FROM logbook_entries").get() as any;
    const unplacedStudents = db.prepare(`
      SELECT COUNT(*) as count FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'STUDENT' AND (sp.assigned_company_id IS NULL OR sp.id IS NULL)
    `).get() as any;

    // Recent activity feed (last 8 events)
    const recentActivity = db.prepare(`
      SELECT type, actor, event_date, detail, ts FROM (
        SELECT 'logbook' as type, u.full_name as actor, le.date as event_date,
               le.verification_status as detail, le.created_at as ts
        FROM logbook_entries le JOIN users u ON le.student_id = u.id
        UNION ALL
        SELECT 'application' as type, u.full_name as actor, a.created_at as event_date,
               a.status as detail, a.created_at as ts
        FROM applications a JOIN users u ON a.student_id = u.id
      ) ORDER BY ts DESC LIMIT 8
    `).all().map((row: any) => ({ ...row, created_at: row.ts }));

    // Department breakdown — TRIM whitespace so duplicates like "software engineering " merge
    const deptBreakdown = db.prepare(`
      SELECT TRIM(sp.department) as department, COUNT(*) as count
      FROM student_profiles sp
      WHERE sp.department IS NOT NULL AND TRIM(sp.department) != ''
      GROUP BY TRIM(sp.department) ORDER BY count DESC LIMIT 6
    `).all();


    res.json({
      totalStudents: totalStudents.count,
      totalPlacements: totalPlacements.count,
      unplacedStudents: unplacedStudents.count,
      verifiedLogs: verifiedLogs.count,
      flaggedLogs: flaggedLogs.count,
      pendingLogs: pendingLogs.count,
      totalLogs: totalLogs.count,
      activeSupervisors: activeSupervisors.count,
      totalCompanies: totalCompanies.count,
      pendingApplications: pendingApplications.count,
      recentActivity,
      deptBreakdown,
    });
  });


  app.get("/api/admin/applications", authenticate, authorize("VIEW_ALL_STUDENTS"), (req: any, res) => {
    const apps = db.prepare(`
      SELECT a.*, u.full_name, c.name as company_name 
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN companies c ON a.company_id = c.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(apps);
  });

  app.get("/api/admin/location-requests", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const requests = db.prepare(`
      SELECT l.*, u.full_name, u.email
      FROM location_change_requests l
      JOIN users u ON l.student_id = u.id
      ORDER BY l.created_at DESC
    `).all();
    res.json(requests);
  });

  app.put("/api/admin/location-requests/:id/status", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { status } = req.body;
    try {
      db.transaction(() => {
        db.prepare("UPDATE location_change_requests SET status = ? WHERE id = ?").run(status, req.params.id);

        if (status === 'APPROVED') {
          const reqDoc = db.prepare("SELECT student_id FROM location_change_requests WHERE id = ?").get(req.params.id) as any;
          if (reqDoc) {
            db.prepare("UPDATE student_profiles SET internship_latitude = NULL, internship_longitude = NULL WHERE user_id = ?").run(reqDoc.student_id);
            // Notify student
            db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
              reqDoc.student_id,
              `✅ Your request to change location was approved. Please register your new workplace GPS in the Logbook tab.`
            );
          }
        } else if (status === 'REJECTED') {
          const reqDoc = db.prepare("SELECT student_id FROM location_change_requests WHERE id = ?").get(req.params.id) as any;
          if (reqDoc) {
            db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
              reqDoc.student_id,
              `❌ Your request to change location was rejected. Please contact the administrator.`
            );
          }
        }
      })();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/applications/:id/status", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { status } = req.body;
    try {
      db.transaction(() => {
        db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, req.params.id);

        if (status === 'APPROVED') {
          const app = db.prepare("SELECT student_id, company_id FROM applications WHERE id = ?").get(req.params.id) as any;
          if (app) {
            // Assign the student to this company
            db.prepare("UPDATE student_profiles SET assigned_company_id = ? WHERE user_id = ?").run(app.company_id, app.student_id);
            const company: any = db.prepare("SELECT name FROM companies WHERE id = ?").get(app.company_id);

            // Auto-clear all OTHER pending/rejected applications from this student
            db.prepare(
              `DELETE FROM applications WHERE student_id = ? AND id != ? AND status IN ('PENDING', 'REJECTED')`
            ).run(app.student_id, req.params.id);

            // Notify student of approval
            db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
              app.student_id,
              `✅ Your application to ${company?.name || 'a company'} has been approved! You are now officially placed. All your other pending applications have been automatically cleared.`
            );
          }
        } else if (status === 'REJECTED') {
          const app = db.prepare("SELECT student_id, company_id FROM applications WHERE id = ?").get(req.params.id) as any;
          if (app) {
            const company: any = db.prepare("SELECT name FROM companies WHERE id = ?").get(app.company_id);
            db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
              app.student_id,
              `❌ Your application to ${company?.name || 'a company'} was not approved. Please apply to another company.`
            );
          }
        }
      })();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/admin/users", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const users = db.prepare("SELECT id, email, full_name, role FROM users").all();
    res.json(users);
  });

  app.put("/api/admin/users/:id/role", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { role } = req.body;
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/students", authenticate, authorize("VIEW_ALL_STUDENTS"), (req: any, res) => {
    const students = db.prepare(`
      SELECT u.id, u.full_name, u.email, sp.course, sp.department, sp.school_supervisor_id, sp.assigned_company_id, sp.mat_number
      FROM users u 
      JOIN student_profiles sp ON u.id = sp.user_id
    `).all();
    res.json(students);
  });

  app.put("/api/admin/students/:id/assign", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { school_supervisor_id, assigned_company_id } = req.body;

    const current = db.prepare("SELECT school_supervisor_id, assigned_company_id FROM student_profiles WHERE user_id = ?").get(req.params.id) as any;

    if (!current) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const newSup = school_supervisor_id !== undefined ? school_supervisor_id : current.school_supervisor_id;
    const newComp = assigned_company_id !== undefined ? assigned_company_id : current.assigned_company_id;

    db.prepare(`
      UPDATE student_profiles 
      SET school_supervisor_id = ?, assigned_company_id = ? 
      WHERE user_id = ?
    `).run(newSup, newComp, req.params.id);
    res.json({ success: true });
  });

  // Admin sets internship start/end dates for a student
  app.put("/api/admin/students/:id/internship-dates", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { internship_start_date, internship_end_date, total_weeks } = req.body;
    db.prepare(`
      UPDATE student_profiles 
      SET internship_start_date = ?, internship_end_date = ?, total_weeks = ?
      WHERE user_id = ?
    `).run(internship_start_date || null, internship_end_date || null, total_weeks || 24, req.params.id);
    res.json({ success: true });
  });

  // Public company list — any authenticated user can read (needed for map)
  app.get("/api/companies", authenticate, (req: any, res) => {
    const companies = db.prepare("SELECT * FROM companies ORDER BY name ASC").all();
    res.json(companies);
  });

  app.get("/api/admin/companies", authenticate, authorize("MANAGE_COMPANIES"), (req: any, res) => {
    const companies = db.prepare("SELECT * FROM companies ORDER BY name ASC").all();
    res.json(companies);
  });


  app.post("/api/admin/companies", authenticate, authorize("MANAGE_COMPANIES"), (req: any, res) => {
    const { name, email, industry_type, required_skills, address, latitude, longitude } = req.body;
    db.prepare(`
      INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, industry_type, JSON.stringify(required_skills), address, latitude, longitude);
    res.json({ success: true });
  });

  app.get("/api/supervisor/students", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), (req: any, res) => {
    const students = db.prepare(`
      SELECT u.id, u.full_name, u.email, sp.course, sp.department,
             sp.school_supervisor_id, sp.assigned_company_id, sp.mat_number,
             c.name as assigned_company_name
      FROM users u 
      JOIN student_profiles sp ON u.id = sp.user_id 
      LEFT JOIN companies c ON sp.assigned_company_id = c.id
      WHERE sp.school_supervisor_id = ?
    `).all(req.user.id);
    res.json(students);
  });


  app.get("/api/supervisor/students/:id/logbook", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), (req: any, res) => {
    const entries = db.prepare("SELECT * FROM logbook_entries WHERE student_id = ? ORDER BY date DESC").all(req.params.id);
    res.json(entries);
  });

  app.put("/api/supervisor/logbook/:id/comment", authenticate, authorize("APPROVE_LOGS"), (req: any, res) => {
    const { comment } = req.body;
    db.prepare("UPDATE logbook_entries SET supervisor_comment = ? WHERE id = ?").run(comment, req.params.id);
    // Notify the student
    const log: any = db.prepare("SELECT student_id FROM logbook_entries WHERE id = ?").get(req.params.id);
    if (log) {
      const sup: any = db.prepare("SELECT full_name FROM users WHERE id = ?").get(req.user.id);
      db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(
        log.student_id,
        `💬 ${sup?.full_name || 'Your supervisor'} commented on your logbook entry.`
      );
    }
    res.json({ success: true });
  });

  app.get("/api/supervisor/students/:id/grade", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), (req: any, res) => {
    const assessment = db.prepare("SELECT * FROM assessments WHERE student_id = ?").get(req.params.id);
    res.json(assessment || {});
  });



  app.post("/api/supervisor/students/:id/grade", authenticate, authorize("APPROVE_LOGS"), (req: any, res) => {
    const { grade, remarks } = req.body;

    const existing = db.prepare("SELECT * FROM assessments WHERE student_id = ?").get(req.params.id);

    if (existing) {
      db.prepare("UPDATE assessments SET school_grade = ?, final_remarks = ? WHERE student_id = ?").run(grade, remarks, req.params.id);
    } else {
      db.prepare("INSERT INTO assessments (student_id, school_grade, final_remarks) VALUES (?, ?, ?)").run(req.params.id, grade, remarks);
    }
    res.json({ success: true });
  });

  // --- MEMOS / BROADCASTS ---
  app.post("/api/admin/memos", authenticate, authorize("MANAGE_USERS"), (req: any, res) => {
    const { recipient_group, message } = req.body;
    try {
      db.prepare(`
        INSERT INTO memos (sender_id, recipient_group, message)
        VALUES (?, ?, ?)
      `).run(req.user.id, recipient_group, message);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/memos", authenticate, (req: any, res) => {
    const roleGroup = req.user.role === 'STUDENT' ? 'STUDENTS' :
      (req.user.role === 'ADMIN' ? 'ALL' : 'SUPERVISORS');

    let memos;
    if (req.user.role === 'ADMIN') {
      memos = db.prepare(`
        SELECT m.*, u.full_name as sender_name 
        FROM memos m
        JOIN users u ON m.sender_id = u.id
        ORDER BY m.created_at DESC
      `).all();
    } else {
      memos = db.prepare(`
        SELECT m.*, u.full_name as sender_name 
        FROM memos m
        JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_group = 'ALL' OR m.recipient_group = ?
        ORDER BY m.created_at DESC
      `).all(roleGroup);
    }
    res.json(memos);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
