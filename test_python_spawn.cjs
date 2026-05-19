const { spawnSync } = require('child_process');

const input = JSON.stringify({
    student: {
        "course": "Computer Science",
        "skills": '["Python", "React", "SQL"]',
        "location_preference": "Lagos"
    },
    companies: [
        {
            "name": "TechCorp",
            "industry_type": "Software Development",
            "required_skills": '["Python", "Django"]',
            "address": "Lagos"
        }]
});

const pythonProcess = spawnSync("python", ["ai_engine.py", input]);
console.log("Error:", pythonProcess.error);
console.log("Stdout:", pythonProcess.stdout ? pythonProcess.stdout.toString() : '');
console.log("Stderr:", pythonProcess.stderr ? pythonProcess.stderr.toString() : '');
