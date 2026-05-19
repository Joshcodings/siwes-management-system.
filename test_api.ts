import db from './src/db';
import { spawnSync } from 'child_process';

async function runTest() {
    const students = await db.all("SELECT * FROM student_profiles") as any[];
    const companies = await db.all("SELECT * FROM companies") as any[];

    console.log("Found students:", students.length);
    console.log("Found companies:", companies.length);

    if (students.length > 0) {
        const student = students[0];
        const studentData = {
            ...student,
            skills: JSON.parse(student.skills || "[]")
        };

        const companiesData = companies.map((c: any) => ({
            ...c,
            required_skills: JSON.parse(c.required_skills || "[]")
        }));

        const input = JSON.stringify({ student: studentData, companies: companiesData });
        const pythonProcess = spawnSync("python", ["ai_engine.py", input]);

        console.log("Python Error:", pythonProcess.error);
        const output = pythonProcess.stdout ? pythonProcess.stdout.toString() : '';
        console.log("Python Output:", output);
        console.log("Python Stderr:", pythonProcess.stderr ? pythonProcess.stderr.toString() : '');

        try {
            const parsed = JSON.parse(output);
            console.log("Is Array?", Array.isArray(parsed));
            if (!Array.isArray(parsed)) {
                console.log("Object keys:", Object.keys(parsed));
            }
        } catch (e) {
            console.error("Parse failed");
        }
    } else {
        console.log("No students to test with.");
    }
}

runTest();
