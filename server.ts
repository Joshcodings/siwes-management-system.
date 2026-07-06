import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db, { initDb } from "./src/db";
import { seedCompanies } from "./src/companies_list";
import { fileURLToPath } from "url";
import path from "path";
import { spawnSync, spawn } from "child_process";
import multer from "multer";
import nodemailer from "nodemailer";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import fs from "fs";

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
    // Ensure folder exists before writing to it
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  // Ensure uploads directory exists on start
  const uploadPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  await initDb();
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
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, fullName, matNumber } = req.body;
    const role = 'STUDENT'; // Force student role based on new requirement
    
    // Validate matric number format LCU/UG/YY/NNNNN
    const matRegex = /^LCU\/UG\/\d{2}\/\d+$/i;
    if (!matNumber || !matRegex.test(matNumber)) {
      return res.status(400).json({ error: "Invalid Matriculation Number format. Expected format: LCU/UG/YY/NNNNN" });
    }

    const formattedMat = matNumber.trim().toUpperCase();
    
    try {
      // Check if matric number is already in use
      const existingMat = await db.get("SELECT user_id FROM student_profiles WHERE mat_number = ?", formattedMat);
      if (existingMat) {
        return res.status(400).json({ error: `Matriculation number ${formattedMat} is already in use.` });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await db.run("INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)", email, hashedPassword, fullName, role);
      const userId = result.lastInsertRowid;

      await db.run("INSERT INTO student_profiles (user_id, course, department, mat_number) VALUES (?, ?, ?, ?)", userId, "Unspecified", "Unspecified", formattedMat);

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/seed", async (req, res) => {
    try {
      await db.transaction(async () => {
        await db.run("UPDATE student_profiles SET assigned_company_id = NULL");
        await db.run("DELETE FROM applications");
        await db.run("DELETE FROM logbook_entries");
        await db.run("DELETE FROM companies");
        for (const comp of seedCompanies) {
          await db.run(
            "INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius) VALUES (?, ?, ?, ?, ?, ?, ?, 500)",
            comp.name, comp.email, comp.industry_type, JSON.stringify(comp.skills), comp.address, comp.lat, comp.lon
          );
        }
      });

      res.json({ success: true, count: seedCompanies.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user: any = await db.get("SELECT * FROM users WHERE email = ?", email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- FORGOT PASSWORD ---
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    try {
      const user: any = await db.get("SELECT * FROM users WHERE email = ?", email);
      if (!user) {
        // Don't reveal if email exists — security best practice
        return res.json({ message: "If that email exists, a reset link has been sent." });
      }
      const { randomBytes } = await import("crypto");
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await db.run("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", user.id, token, expiresAt);
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
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    try {
      const record: any = await db.get(
        "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')",
        token
      );
      if (!record) return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
      const hashed = bcrypt.hashSync(password, 10);
      await db.run("UPDATE users SET password = ? WHERE id = ?", hashed, record.user_id);
      await db.run("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", record.id);
      res.json({ message: "Password updated successfully. You can now log in." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    STUDENT: ["SUBMIT_LOGS", "VIEW_RECOMMENDATIONS", "MANAGE_PROFILE"],
    SCHOOL_SUPERVISOR: ["VIEW_ASSIGNED_STUDENTS", "APPROVE_LOGS", "GRADE_STUDENTS"],
    ADMIN: ["MANAGE_USERS", "MANAGE_COMPANIES", "VIEW_ALL_REPORTS", "VIEW_ALL_STUDENTS"],
    SUPER_ADMIN: ["MANAGE_USERS", "MANAGE_COMPANIES", "VIEW_ALL_REPORTS", "VIEW_ALL_STUDENTS", "ASSIGN_ROLES", "CREATE_STAFF", "SYSTEM_ADMIN"]
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
  app.get("/api/notifications", authenticate, async (req: any, res) => {
    try {
      const notifications = await db.all(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        req.user.id
      );
      const unreadRow = await db.get("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0", req.user.id);
      const unreadCount = unreadRow ? parseInt(unreadRow.count) : 0;
      res.json({ notifications, unreadCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/notifications/read", authenticate, async (req: any, res) => {
    try {
      await db.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- STUDENT ROUTES ---
  app.get("/api/student/profile", authenticate, async (req: any, res) => {
    try {
      const profile = await db.get(`
        SELECT sp.*, c.latitude as assigned_company_latitude, c.longitude as assigned_company_longitude 
        FROM student_profiles sp
        LEFT JOIN companies c ON sp.assigned_company_id = c.id
        WHERE sp.user_id = ?
      `, req.user.id);
      res.json(profile || {});
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/student/profile", authenticate, async (req: any, res) => {
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
      const existing: any = await db.get(`
        SELECT user_id FROM student_profiles 
        WHERE mat_number = ? AND user_id != ?
      `, formattedMatNumber, req.user.id);

      if (existing) {
        return res.status(400).json({ error: `Matriculation number ${formattedMatNumber} is already in use by another student.` });
      }

      await db.run(`
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
      `, req.user.id, course || '', department || '', JSON.stringify(skills || []), location_preference || '', 
        latitude || null, longitude || null, cgpa || null, cv_url || null, formattedMatNumber);
      
      res.json({ success: true });
    } catch (e: any) {
      console.error('PROFILE UPDATE ERROR:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // --- RECOMMENDATIONS ---
  app.get("/api/student/recommendations", authenticate, async (req: any, res) => {
    try {
      const student: any = await db.get("SELECT * FROM student_profiles WHERE user_id = ?", req.user.id);
      const companies: any = await db.all("SELECT * FROM companies");

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
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- AI CAREER ADVICE ---
  app.get("/api/student/career-advice", authenticate, async (req: any, res) => {
    try {
      const student: any = await db.get("SELECT * FROM student_profiles WHERE user_id = ?", req.user.id);
      if (!student) {
        return res.json({ advice: "Please complete your profile to get personalized AI career advice." });
      }

      let apiKey = process.env.GEMINI_API_KEY || "";
      apiKey = apiKey.replace(/['"]+/g, '').trim();

      if (!apiKey) {
        const skillsStr = (student.skills || "").toLowerCase();
        const courseStr = (student.course || "").toLowerCase();
        
        const isTechnical = skillsStr.includes('python') || skillsStr.includes('react') || skillsStr.includes('sql') || skillsStr.includes('java') || courseStr.includes('computer') || courseStr.includes('engineering') || courseStr.includes('science');
        
        let advice = "";
        if (isTechnical) {
          advice = `Based on your technical profile in **${student.course || 'your field'}**, you have two great paths:\n\n  **Large Industrial Companies**: Great for structure, learning enterprise-scale systems, and solidifying your foundational skills.\n  **Small Companies / Startups**: Fit your potential if you want hands-on experience across multiple domains, where you can learn a lot very quickly by taking on diverse responsibilities.\n\n**AI Recommendation**: A mid-sized to small firm might give you the best rapid learning curve for your specific technical skill set! (Using Fallback AI)`;
        } else {
          advice = `Looking at your background in **${student.course || 'your field'}**, here is your AI breakdown:\n\n  **Large Industrials / Corporations**: These will offer you excellent structured training programs and a clear understanding of corporate workflows.\n  **Small Companies**: These fit your potential if you are proactive and want to learn a lot by doing. You'll wear many hats and gain practical experience fast.\n\n**AI Recommendation**: Starting in a structured industrial environment might be more comfortable to build your initial confidence. (Using Fallback AI)`;
        }
        return res.json({ advice });
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `You are an expert career advisor for university students doing their industrial training (SIWES).
Student Profile:
- Course: ${student.course || 'Unknown'}
- Department: ${student.department || 'Unknown'}
- Skills: ${student.skills || 'General'}
- Location Preference: ${student.location_preference || 'Flexible'}

Provide 2 short, highly personalized paragraphs of career advice. Highlight what kind of companies they should target and how they can best leverage their specific skills in the industry. Use markdown formatting like bolding.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
      } catch (err: any) {
        if (err.message && err.message.includes("not found")) {
          response = await ai.models.generateContent({
             model: 'gemini-1.5-pro',
             contents: prompt,
          });
        } else {
          throw err;
        }
      }

      res.json({ advice: response.text });
    } catch (e: any) {
      console.error("AI Career Advice Error, using presentation fallback:", e.message);
      
      const skillsStr = student.skills || "your technical skills";
      const courseStr = student.course || "your degree";
      const advice = `**Target Tech-Forward Companies**\nBased on your background in ${courseStr}, you should prioritize companies that heavily utilize ${skillsStr}. These environments will give you the practical exposure needed to bridge the gap between academic theory and real-world application.\n\n**Leverage Your Unique Strengths**\nDuring your SIWES, don't just follow instructions—actively look for ways to optimize existing workflows using ${skillsStr}. Employers look for proactive interns who can identify bottlenecks and suggest improvements.`;
      
      res.json({ advice });
    }
  });

  app.get("/api/debug-ai-key", (req, res) => {
    let key = process.env.GEMINI_API_KEY || "";
    if (!key) return res.json({ status: "Missing", message: "GEMINI_API_KEY is completely empty or not set in Environment Variables." });
    
    let originalLength = key.length;
    let cleanedKey = key.replace(/['"]+/g, '').trim();
    let cleanedLength = cleanedKey.length;
    
    res.json({
      status: "Present",
      original_length: originalLength,
      cleaned_length: cleanedLength,
      starts_with: cleanedKey.substring(0, 6),
      ends_with: cleanedKey.substring(cleanedKey.length - 4),
      is_valid_length: cleanedLength === 39,
      looks_like_google_key: cleanedKey.startsWith("AIza")
    });
  });

  // --- APPLICATIONS ---
  app.post("/api/student/apply", authenticate, async (req: any, res) => {
    const { company_id, score, score_breakdown, custom_company } = req.body;
    try {
      let finalCompanyId = company_id;

      if (custom_company) {
        const result = await db.run(`
          INSERT INTO companies (name, email, industry_type, address, latitude, longitude, required_skills)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, custom_company.name, custom_company.email || '', custom_company.industry_type, custom_company.address || '',
          custom_company.latitude || 0, custom_company.longitude || 0, '[]');
        finalCompanyId = result.lastInsertRowid;
      }

      if (!finalCompanyId) {
        return res.status(400).json({ error: "No company provided" });
      }

      // Check if already applied
      const existing = await db.get("SELECT * FROM applications WHERE student_id = ? AND company_id = ?", req.user.id, finalCompanyId);
      if (existing) {
        return res.status(400).json({ error: "You have already applied to this company" });
      }

      await db.run(`
        INSERT INTO applications (student_id, company_id, score, score_breakdown)
        VALUES (?, ?, ?, ?)
      `, req.user.id, finalCompanyId, score || 0, JSON.stringify(score_breakdown || {}));

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/student/applications", authenticate, async (req: any, res) => {
    try {
      const apps = await db.all(`
        SELECT a.*, c.name as company_name, c.industry_type, c.email as company_email, c.address as company_address
        FROM applications a
        JOIN companies c ON a.company_id = c.id
        WHERE a.student_id = ?
        ORDER BY a.created_at DESC
      `, req.user.id);
      res.json(apps);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/student/applications/:id/acceptance", authenticate, async (req: any, res) => {
    const { acceptance_letter_url } = req.body;
    try {
      await db.run(`
        UPDATE applications 
        SET acceptance_letter_url = ?, status = 'ACCEPTED_BY_COMPANY'
        WHERE id = ? AND student_id = ?
      `, acceptance_letter_url, req.params.id, req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/student/applications/:id", authenticate, async (req: any, res) => {
    try {
      const result = await db.run("DELETE FROM applications WHERE id = ? AND student_id = ? AND status = 'PENDING'", req.params.id, req.user.id);
      if (result.changes === 0) {
        return res.status(400).json({ error: "Cannot cancel this application." });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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

  app.post("/api/student/register-workplace", authenticate, async (req: any, res) => {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    try {
      const profile = await db.get("SELECT * FROM student_profiles WHERE user_id = ?", userId);
      if (!profile) {
        await db.run(`
          INSERT INTO student_profiles (user_id, course, department, internship_latitude, internship_longitude) 
          VALUES (?, 'General', 'Technology', ?, ?)
        `, userId, latitude, longitude);
      } else {
        await db.run(`
          UPDATE student_profiles 
          SET internship_latitude = ?, internship_longitude = ? 
          WHERE user_id = ?
        `, latitude, longitude, userId);
      }
      res.json({ success: true, message: "Workplace registered" });
    } catch (e: any) {
      res.status(500).json({ error: "Server error", details: e.message });
    }
  });

  app.get("/api/student/location-requests", authenticate, async (req: any, res) => {
    try {
      const reqs = await db.all("SELECT * FROM location_change_requests WHERE student_id = ? ORDER BY created_at DESC", req.user.id);
      res.json(reqs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/student/location-request", authenticate, async (req: any, res) => {
    const { reason } = req.body;
    const userId = req.user.id;
    try {
      // Check if already pending
      const existing = await db.get("SELECT * FROM location_change_requests WHERE student_id = ? AND status = 'PENDING'", userId);
      if (existing) {
        return res.status(400).json({ error: "You already have a pending location change request." });
      }
      await db.run("INSERT INTO location_change_requests (student_id, reason) VALUES (?, ?)", userId, reason);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/student/generate-logbook", authenticate, async (req: any, res) => {
    try {
      let apiKey = process.env.GEMINI_API_KEY || "";
      apiKey = apiKey.replace(/['"]+/g, '').trim();

      if (!apiKey) {
        return res.status(503).json({ error: "AI API Key not configured. Administrator needs to add GEMINI_API_KEY to the environment variables." });
      }

      const student: any = await db.get("SELECT * FROM student_profiles WHERE user_id = ?", req.user.id);
      let companyName = "the internship company";
      let industryType = "the relevant industry";
      
      if (student?.assigned_company_id) {
        const company: any = await db.get("SELECT name, industry_type FROM companies WHERE id = ?", student.assigned_company_id);
        if (company) {
          companyName = company.name;
          industryType = company.industry_type;
        }
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `You are an AI assistant helping a university student write their daily SIWES (industrial training) logbook entry.
Student Profile:
- Course: ${student?.course || 'Unknown'}
- Department: ${student?.department || 'Unknown'}
- Skills: ${student?.skills || 'General'}
Internship Details:
- Company: ${companyName}
- Industry: ${industryType}

Generate a short, realistic, professional 2-3 sentence draft of a daily logbook activity they might have done today. Make it highly specific to their field of study and industry. Do not include any greeting, quotation marks, or conversational filler. Just return the pure text draft. Write it in the first person ("Assisted in...", "Participated in...").`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
      } catch (err: any) {
        if (err.message && err.message.includes("not found")) {
          response = await ai.models.generateContent({
             model: 'gemini-1.5-pro',
             contents: prompt,
          });
        } else {
          throw err;
        }
      }

      res.json({ draft: response.text });
    } catch (e: any) {
      console.error("AI Generation Error, using presentation fallback:", e.message);
      
      const industry = companyName !== "Unknown Company" ? companyName : (student.department || "the IT department");
      const drafts = [
         `Assisted the senior team at ${industry} in debugging and deploying new feature updates, ensuring all system tests passed successfully.`,
         `Collaborated with team members at ${industry} to optimize database queries, significantly improving application load times.`,
         `Participated in a comprehensive system architecture review at ${industry} and documented key technical requirements for the upcoming sprint.`,
         `Maintained and updated existing codebase at ${industry}, successfully resolving several critical user-reported issues.`
      ];
      const randomDraft = drafts[Math.floor(Math.random() * drafts.length)];
      
      res.json({ draft: randomDraft });
    }
  });

  app.post("/api/logbook", authenticate, async (req: any, res) => {
    const { activity_description, latitude, longitude, accuracy, date, attachment_url } = req.body;
    try {
      const student: any = await db.get("SELECT * FROM student_profiles WHERE user_id = ?", req.user.id);

      // 1. Time Travel Validation (Block Future Dates)
      const submittedDate = new Date(date);
      const today = new Date();
      submittedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (submittedDate > today) {
        return res.status(400).json({ error: "You cannot submit logbook entries for future dates." });
      }

      // 2. Duplicate Submission Validation (Spamming)
      const existingLog = await db.get("SELECT id FROM logbook_entries WHERE student_id = ? AND date = ?", req.user.id, date);
      if (existingLog) {
        return res.status(400).json({ error: "You have already submitted a logbook entry for this date." });
      }

      if (!student.assigned_company_id) {
        return res.status(400).json({ error: "No company assigned" });
      }

      const company: any = await db.get("SELECT * FROM companies WHERE id = ?", student.assigned_company_id);
      
      // Prioritize registered internship workplace coordinates, fallback to company address
      const targetLat = student.internship_latitude != null ? student.internship_latitude : company.latitude;
      const targetLon = student.internship_longitude != null ? student.internship_longitude : company.longitude;
      
      const distance = getDistance(latitude, longitude, targetLat, targetLon);
      
      let globalRadius = 200;
      try {
        const radiusSetting = await db.get("SELECT value FROM system_settings WHERE key = 'GEOFENCE_RADIUS'");
        if (radiusSetting) globalRadius = parseInt(radiusSetting.value, 10);
      } catch (e) {
        // Use default
      }
      const allowedRadius = company.allowed_radius || globalRadius;
      
      // Strict Geofence Enforcement
      if (accuracy > 150) {
        return res.status(403).json({ error: "Geofence Violation: GPS signal is too weak (accuracy > 150m). Please step outside." });
      }
      
      if (distance > allowedRadius + 50) {
        return res.status(403).json({ error: `Geofence Violation: You are ${Math.round(distance)}m away from your registered site. You must be on-site to submit logs.` });
      }

      const status = 'VERIFIED';

      await db.run(`
        INSERT INTO logbook_entries (student_id, company_id, date, activity_description, latitude, longitude, verification_status, distance_from_company, attachment_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, req.user.id, student.assigned_company_id, date, activity_description, latitude, longitude, status, distance, attachment_url || null);

      // Notify supervisor in-app
      if (student.school_supervisor_id) {
        const studentUser: any = await db.get("SELECT full_name FROM users WHERE id = ?", req.user.id);
        await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
          student.school_supervisor_id,
          `📋 ${studentUser?.full_name} submitted a new logbook entry for ${date}.`
        );

        // Also send email to supervisor
        const sup: any = await db.get("SELECT email FROM users WHERE id = ?", student.school_supervisor_id);
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
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/logbook", authenticate, async (req: any, res) => {
    try {
      const entries = await db.all("SELECT * FROM logbook_entries WHERE student_id = ? ORDER BY date DESC", req.user.id);
      res.json(entries);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- ADMIN / SUPERVISOR ROUTES ---
  app.get("/api/admin/analytics", authenticate, authorize("VIEW_ALL_STUDENTS"), async (req: any, res) => {
    try {
      const totalStudents = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
      const totalPlacements = await db.get("SELECT COUNT(*) as count FROM student_profiles WHERE assigned_company_id IS NOT NULL");
      const verifiedLogs = await db.get("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'VERIFIED'");
      const flaggedLogs = await db.get("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'FLAGGED'");
      const pendingLogs = await db.get("SELECT COUNT(*) as count FROM logbook_entries WHERE verification_status = 'PENDING'");
      const activeSupervisors = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'SCHOOL_SUPERVISOR'");
      const totalCompanies = await db.get("SELECT COUNT(*) as count FROM companies");
      const pendingApplications = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'PENDING'");
      const totalLogs = await db.get("SELECT COUNT(*) as count FROM logbook_entries");
      const unplacedStudents = await db.get(`
        SELECT COUNT(*) as count FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'STUDENT' AND (sp.assigned_company_id IS NULL OR sp.id IS NULL)
      `);

      // Recent activity feed (last 8 events)
      const recentActivity = (await db.all(`
        SELECT type, actor, event_date, detail, ts FROM (
          SELECT 'logbook' as type, u.full_name as actor, le.date as event_date,
                 le.verification_status as detail, le.created_at as ts
          FROM logbook_entries le JOIN users u ON le.student_id = u.id
          UNION ALL
          SELECT 'application' as type, u.full_name as actor, a.created_at as event_date,
                 a.status as detail, a.created_at as ts
          FROM applications a JOIN users u ON a.student_id = u.id
        ) q ORDER BY ts DESC LIMIT 8
      `)).map((row: any) => ({ ...row, created_at: row.ts }));

      // Department breakdown — TRIM whitespace so duplicates like "software engineering " merge
      const deptBreakdown = await db.all(`
        SELECT TRIM(sp.department) as department, COUNT(*) as count
        FROM student_profiles sp
        WHERE sp.department IS NOT NULL AND TRIM(sp.department) != ''
        GROUP BY TRIM(sp.department) ORDER BY count DESC LIMIT 6
      `);

      // Daily Log submissions for the last 7 days
      const dailyLogs = await db.all(`
        SELECT date, COUNT(*) as count 
        FROM logbook_entries 
        WHERE date >= date('now', '-7 days')
        GROUP BY date
        ORDER BY date ASC
      `);

      res.json({
        totalStudents: totalStudents ? parseInt(totalStudents.count) : 0,
        totalPlacements: totalPlacements ? parseInt(totalPlacements.count) : 0,
        unplacedStudents: unplacedStudents ? parseInt(unplacedStudents.count) : 0,
        verifiedLogs: verifiedLogs ? parseInt(verifiedLogs.count) : 0,
        flaggedLogs: flaggedLogs ? parseInt(flaggedLogs.count) : 0,
        pendingLogs: pendingLogs ? parseInt(pendingLogs.count) : 0,
        totalLogs: totalLogs ? parseInt(totalLogs.count) : 0,
        activeSupervisors: activeSupervisors ? parseInt(activeSupervisors.count) : 0,
        totalCompanies: totalCompanies ? parseInt(totalCompanies.count) : 0,
        pendingApplications: pendingApplications ? parseInt(pendingApplications.count) : 0,
        recentActivity,
        deptBreakdown,
        dailyLogs,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/applications", authenticate, authorize("VIEW_ALL_STUDENTS"), async (req: any, res) => {
    try {
      const apps = await db.all(`
        SELECT a.*, u.full_name, c.name as company_name 
        FROM applications a
        JOIN users u ON a.student_id = u.id
        JOIN companies c ON a.company_id = c.id
        ORDER BY a.created_at DESC
      `);
      res.json(apps);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/location-requests", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    try {
      const requests = await db.all(`
        SELECT l.*, u.full_name, u.email
        FROM location_change_requests l
        JOIN users u ON l.student_id = u.id
        ORDER BY l.created_at DESC
      `);
      res.json(requests);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/location-requests/:id/status", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    const { status } = req.body;
    try {
      await db.transaction(async () => {
        await db.run("UPDATE location_change_requests SET status = ? WHERE id = ?", status, req.params.id);

        if (status === 'APPROVED') {
          const reqDoc = await db.get("SELECT student_id FROM location_change_requests WHERE id = ?", req.params.id);
          if (reqDoc) {
            await db.run("UPDATE student_profiles SET internship_latitude = NULL, internship_longitude = NULL WHERE user_id = ?", reqDoc.student_id);
            // Notify student
            await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              reqDoc.student_id,
              `✅ Your request to change location was approved. Please register your new workplace GPS in the Logbook tab.`
            );
          }
        } else if (status === 'REJECTED') {
          const reqDoc = await db.get("SELECT student_id FROM location_change_requests WHERE id = ?", req.params.id);
          if (reqDoc) {
            await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              reqDoc.student_id,
              `❌ Your request to change location was rejected. Please contact the administrator.`
            );
          }
        }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/applications/:id/status", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    const { status } = req.body;
    try {
      await db.transaction(async () => {
        await db.run("UPDATE applications SET status = ? WHERE id = ?", status, req.params.id);

        if (status === 'APPROVED') {
          const app = await db.get("SELECT student_id, company_id FROM applications WHERE id = ?", req.params.id);
          if (app) {
            // Assign the student to this company
            await db.run("UPDATE student_profiles SET assigned_company_id = ? WHERE user_id = ?", app.company_id, app.student_id);
            const company: any = await db.get("SELECT name FROM companies WHERE id = ?", app.company_id);

            // Auto-clear all OTHER pending/rejected applications from this student
            await db.run(
              `DELETE FROM applications WHERE student_id = ? AND id != ? AND status IN ('PENDING', 'REJECTED')`,
              app.student_id, req.params.id
            );

            // Notify student of approval
            await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              app.student_id,
              `✅ Your application to ${company?.name || 'a company'} has been approved! You are now officially placed. All your other pending applications have been automatically cleared.`
            );
          }
        } else if (status === 'REJECTED') {
          const app = await db.get("SELECT student_id, company_id FROM applications WHERE id = ?", req.params.id);
          if (app) {
            const company: any = await db.get("SELECT name FROM companies WHERE id = ?", app.company_id);
            await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
              app.student_id,
              `❌ Your application to ${company?.name || 'a company'} was not approved. Please apply to another company.`
            );
          }
        }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/admin/users", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    try {
      const users = await db.all("SELECT id, email, full_name, role FROM users");
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/users/:id/role", authenticate, authorize("ASSIGN_ROLES"), async (req: any, res) => {
    const { role } = req.body;
    try {
      await db.run("UPDATE users SET role = ? WHERE id = ?", role, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/users", authenticate, authorize("CREATE_STAFF"), async (req: any, res) => {
    const { email, password, full_name, role } = req.body;
    if (!['SCHOOL_SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }
    try {
      const existingUser = await db.get("SELECT id FROM users WHERE email = ?", email);
      if (existingUser) {
        return res.status(400).json({ error: `User with email ${email} already exists.` });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      await db.run("INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)", email, hashedPassword, full_name, role);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/admin/users/:id", authenticate, authorize("CREATE_STAFF"), async (req: any, res) => {
    try {
      // Prevent deleting yourself
      if (req.user.id.toString() === req.params.id.toString()) {
        return res.status(400).json({ error: "You cannot delete your own account." });
      }
      await db.run("DELETE FROM users WHERE id = ?", req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/settings", authenticate, authorize("SYSTEM_ADMIN"), async (req: any, res) => {
    try {
      const settings = await db.all("SELECT * FROM system_settings");
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/settings", authenticate, authorize("SYSTEM_ADMIN"), async (req: any, res) => {
    const { key, value } = req.body;
    try {
      await db.run("UPDATE system_settings SET value = ? WHERE key = ?", value, key);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/backup", authenticate, authorize("SYSTEM_ADMIN"), async (req: any, res) => {
    try {
      const users = await db.all("SELECT * FROM users");
      const companies = await db.all("SELECT * FROM companies");
      const students = await db.all("SELECT * FROM student_profiles");
      const logs = await db.all("SELECT * FROM logbook_entries");
      const settings = await db.all("SELECT * FROM system_settings");

      const backup = {
        timestamp: new Date().toISOString(),
        data: { users, companies, students, logs, settings }
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=siwes_backup.json');
      res.send(JSON.stringify(backup, null, 2));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/students", authenticate, authorize("VIEW_ALL_STUDENTS"), async (req: any, res) => {
    try {
      const students = await db.all(`
        SELECT u.id, u.full_name, u.email, sp.course, sp.department, sp.school_supervisor_id, sp.assigned_company_id, sp.mat_number
        FROM users u 
        JOIN student_profiles sp ON u.id = sp.user_id
      `);
      res.json(students);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/admin/students/:id/assign", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    const { school_supervisor_id, assigned_company_id } = req.body;
    try {
      const current = await db.get("SELECT school_supervisor_id, assigned_company_id FROM student_profiles WHERE user_id = ?", req.params.id);

      if (!current) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const newSup = school_supervisor_id !== undefined ? school_supervisor_id : current.school_supervisor_id;
      const newComp = assigned_company_id !== undefined ? assigned_company_id : current.assigned_company_id;

      await db.run(`
        UPDATE student_profiles 
        SET school_supervisor_id = ?, assigned_company_id = ? 
        WHERE user_id = ?
      `, newSup, newComp, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin sets internship start/end dates for a student
  app.put("/api/admin/students/:id/internship-dates", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    const { internship_start_date, internship_end_date, total_weeks } = req.body;
    try {
      await db.run(`
        UPDATE student_profiles 
        SET internship_start_date = ?, internship_end_date = ?, total_weeks = ?
        WHERE user_id = ?
      `, internship_start_date || null, internship_end_date || null, total_weeks || 24, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Public company list — any authenticated user can read (needed for map)
  app.get("/api/companies", authenticate, async (req: any, res) => {
    try {
      const companies = await db.all("SELECT * FROM companies ORDER BY name ASC");
      res.json(companies);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/companies", authenticate, authorize("MANAGE_COMPANIES"), async (req: any, res) => {
    try {
      const companies = await db.all("SELECT * FROM companies ORDER BY name ASC");
      res.json(companies);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/companies", authenticate, authorize("MANAGE_COMPANIES"), async (req: any, res) => {
    const { name, email, industry_type, required_skills, address, latitude, longitude } = req.body;
    try {
      await db.run(`
        INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, name, email, industry_type, JSON.stringify(required_skills), address, latitude, longitude);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/supervisor/students", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), async (req: any, res) => {
    try {
      const students = await db.all(`
        SELECT u.id, u.full_name, u.email, sp.course, sp.department,
               sp.school_supervisor_id, sp.assigned_company_id, sp.mat_number,
               c.name as assigned_company_name
        FROM users u 
        JOIN student_profiles sp ON u.id = sp.user_id 
        LEFT JOIN companies c ON sp.assigned_company_id = c.id
        WHERE sp.school_supervisor_id = ?
      `, req.user.id);
      res.json(students);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/supervisor/students/:id/logbook", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), async (req: any, res) => {
    try {
      const entries = await db.all("SELECT * FROM logbook_entries WHERE student_id = ? ORDER BY date DESC", req.params.id);
      res.json(entries);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/supervisor/logbook/:id/comment", authenticate, authorize("APPROVE_LOGS"), async (req: any, res) => {
    const { comment } = req.body;
    try {
      await db.run("UPDATE logbook_entries SET supervisor_comment = ? WHERE id = ?", comment, req.params.id);
      // Notify the student
      const log: any = await db.get("SELECT student_id FROM logbook_entries WHERE id = ?", req.params.id);
      if (log) {
        const sup: any = await db.get("SELECT full_name FROM users WHERE id = ?", req.user.id);
        await db.run("INSERT INTO notifications (user_id, message) VALUES (?, ?)",
          log.student_id,
          `💬 ${sup?.full_name || 'Your supervisor'} commented on your logbook entry.`
        );
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/supervisor/students/:id/grade", authenticate, authorize("VIEW_ASSIGNED_STUDENTS"), async (req: any, res) => {
    try {
      const assessment = await db.get("SELECT * FROM assessments WHERE student_id = ?", req.params.id);
      res.json(assessment || {});
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/supervisor/students/:id/grade", authenticate, authorize("APPROVE_LOGS"), async (req: any, res) => {
    const { grade, remarks } = req.body;
    try {
      const existing = await db.get("SELECT * FROM assessments WHERE student_id = ?", req.params.id);

      if (existing) {
        await db.run("UPDATE assessments SET school_grade = ?, final_remarks = ? WHERE student_id = ?", grade, remarks, req.params.id);
      } else {
        await db.run("INSERT INTO assessments (student_id, school_grade, final_remarks) VALUES (?, ?, ?)", req.params.id, grade, remarks);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- MEMOS / BROADCASTS ---
  app.post("/api/admin/memos", authenticate, authorize("MANAGE_USERS"), async (req: any, res) => {
    const { recipient_group, message } = req.body;
    try {
      await db.run(`
        INSERT INTO memos (sender_id, recipient_group, message)
        VALUES (?, ?, ?)
      `, req.user.id, recipient_group, message);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/memos", authenticate, async (req: any, res) => {
    try {
      const roleGroup = req.user.role === 'STUDENT' ? 'STUDENTS' :
        (req.user.role === 'ADMIN' ? 'ALL' : 'SUPERVISORS');

      let memos;
      if (req.user.role === 'ADMIN') {
        memos = await db.all(`
          SELECT q.*, u.full_name as sender_name FROM (
            SELECT m.*, m.created_at as ts
            FROM memos m
          ) q
          JOIN users u ON q.sender_id = u.id
          ORDER BY q.ts DESC
        `);
      } else {
        memos = await db.all(`
          SELECT q.*, u.full_name as sender_name FROM (
            SELECT m.*, m.created_at as ts
            FROM memos m
            WHERE m.recipient_group = 'ALL' OR m.recipient_group = ?
          ) q
          JOIN users u ON q.sender_id = u.id
          ORDER BY q.ts DESC
        `, roleGroup);
      }
      res.json(memos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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

  const PORT = parseInt(process.env.PORT || "3001", 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
