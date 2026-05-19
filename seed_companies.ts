import db from './src/db.js';

const companies = [
    {
        name: 'Google',
        email: 'careers@google.com',
        industry_type: 'Technology',
        required_skills: JSON.stringify(['Python', 'Java', 'Machine Learning', 'Data Structures']),
        address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
        latitude: 37.422,
        longitude: -122.0841
    },
    {
        name: 'Microsoft',
        email: 'internships@microsoft.com',
        industry_type: 'Software Development',
        required_skills: JSON.stringify(['C#', '.NET', 'Cloud Computing', 'TypeScript']),
        address: 'One Microsoft Way, Redmond, WA 98052',
        latitude: 47.6422,
        longitude: -122.1368
    },
    {
        name: 'Paystack',
        email: 'careers@paystack.com',
        industry_type: 'Fintech',
        required_skills: JSON.stringify(['Node.js', 'React', 'TypeScript', 'SQL']),
        address: '3A Ladoke Akintola, Ikeja GRA, Lagos, Nigeria',
        latitude: 6.5862,
        longitude: 3.3562
    },
    {
        name: 'Andela',
        email: 'talent@andela.com',
        industry_type: 'Technology Services',
        required_skills: JSON.stringify(['JavaScript', 'Python', 'React', 'Agile']),
        address: '235 Ikorodu Rd, Ilupeju, Lagos, Nigeria',
        latitude: 6.548,
        longitude: 3.366
    },
    {
        name: 'Flutterwave',
        email: 'interns@flutterwavego.com',
        industry_type: 'Fintech',
        required_skills: JSON.stringify(['Java', 'Go', 'React', 'Kubernetes']),
        address: '8 Providence Street, Lekki Phase 1, Lagos, Nigeria',
        latitude: 6.446,
        longitude: 3.472
    }
];

async function seed() {
    try {
        await db.transaction(async () => {
            for (const company of companies) {
                await db.run(
                    `INSERT INTO companies (name, email, industry_type, required_skills, address, latitude, longitude)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    company.name,
                    company.email,
                    company.industry_type,
                    company.required_skills,
                    company.address,
                    company.latitude,
                    company.longitude
                );
            }
        });
        console.log('Seed completed: Added 5 real-world companies.');
    } catch (e: any) {
        console.error('Seed failed:', e.message);
    }
}

seed();
