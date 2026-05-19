const Database = require('better-sqlite3');

const db = new Database('siwes.db');

const companies = [
    {
        name: "Paystack",
        email: "careers@paystack.com",
        industry_type: "FinTech",
        required_skills: JSON.stringify(["React", "Node.js", "TypeScript", "Go", "SQL"]),
        address: "Ikeja, Lagos",
        latitude: 6.6018,
        longitude: 3.3515,
        allowed_radius: 500
    },
    {
        name: "Flutterwave",
        email: "hr@flutterwavego.com",
        industry_type: "FinTech",
        required_skills: JSON.stringify(["Java", "Spring Boot", "React", "Cybersecurity", "Python"]),
        address: "Lekki, Lagos",
        latitude: 6.4382,
        longitude: 3.4905,
        allowed_radius: 500
    },
    {
        name: "Andela",
        email: "jobs@andela.com",
        industry_type: "Software Development",
        required_skills: JSON.stringify(["React", "Python", "Django", "AWS", "Communication"]),
        address: "Lagos",
        latitude: 6.5244,
        longitude: 3.3792,
        allowed_radius: 1000
    },
    {
        name: "MTN Nigeria",
        email: "careers.ng@mtn.com",
        industry_type: "Telecommunications",
        required_skills: JSON.stringify(["Networking", "Linux", "Telecommunications", "Data Analysis", "Project Management"]),
        address: "Ikoyi, Lagos",
        latitude: 6.4526,
        longitude: 3.4293,
        allowed_radius: 400
    },
    {
        name: "Interswitch",
        email: "careers@interswitchgroup.com",
        industry_type: "FinTech",
        required_skills: JSON.stringify(["C#", ".NET", "SQL Server", "System Architecture", "Payment Systems"]),
        address: "Victoria Island, Lagos",
        latitude: 6.4281,
        longitude: 3.4219,
        allowed_radius: 300
    },
    {
        name: "Kuda Bank",
        email: "careers@kuda.com",
        industry_type: "Banking & Finance",
        required_skills: JSON.stringify(["Kotlin", "Swift", "C#", "SQL", "Product Design"]),
        address: "Yaba, Lagos",
        latitude: 6.5054,
        longitude: 3.3736,
        allowed_radius: 300
    },
    {
        name: "PiggyVest",
        email: "careers@piggyvest.com",
        industry_type: "FinTech",
        required_skills: JSON.stringify(["Node.js", "React", "MongoDB", "Marketing", "Customer Support"]),
        address: "Victoria Island, Lagos",
        latitude: 6.4253,
        longitude: 3.4239,
        allowed_radius: 200
    },
    {
        name: "Semicolon Africa",
        email: "hello@semicolon.africa",
        industry_type: "Education & Tech",
        required_skills: JSON.stringify(["Java", "Python", "Design Thinking", "Problem Solving", "Web Development"]),
        address: "Yaba, Lagos",
        latitude: 6.5070,
        longitude: 3.3740,
        allowed_radius: 300
    },
    {
        name: "eTranzact",
        email: "hr@etranzact.com",
        industry_type: "Payment Systems",
        required_skills: JSON.stringify(["Java", "Oracle", "Linux", "Cybersecurity", "Networking"]),
        address: "Victoria Island, Lagos",
        latitude: 6.4312,
        longitude: 3.4300,
        allowed_radius: 400
    },
    {
        name: "Seamfix",
        email: "careers@seamfix.com",
        industry_type: "Software Development",
        required_skills: JSON.stringify(["Java", "React", "Android", "Data Analysis", "Biometrics"]),
        address: "Lekki, Lagos",
        latitude: 6.4428,
        longitude: 3.4735,
        allowed_radius: 500
    }
];

// First, delete existing companies to prevent duplicates and clutter
db.prepare("DELETE FROM companies").run();

const insert = db.prepare(`
  INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude, allowed_radius)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
    for (const comp of companies) {
        insert.run(
            comp.name, comp.email, comp.industry_type, comp.required_skills,
            comp.address, comp.latitude, comp.longitude, comp.allowed_radius
        );
    }
})();

console.log(`Successfully seeded ${companies.length} real-world companies into the database.`);
