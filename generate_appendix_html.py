import os
import html

def escape(text):
    return html.escape(text)

def generate_appendix():
    output_path = r"C:\Users\hp\Downloads\SIWES_Management_System_Appendices.doc"
    
    html_content = """<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>Appendices</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
        h1 { text-align: center; font-size: 16pt; margin-bottom: 24pt; page-break-after: avoid; }
        h2 { font-size: 14pt; margin-top: 24pt; margin-bottom: 12pt; page-break-after: avoid; }
        h3 { font-size: 12pt; margin-top: 18pt; margin-bottom: 6pt; page-break-after: avoid; }
        pre { font-family: Consolas, 'Courier New', monospace; font-size: 9pt; background-color: #f8f9fa; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; word-wrap: break-word; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <h1>APPENDICES</h1>
"""

    def add_appendix(title, description, files):
        nonlocal html_content
        html_content += f"<h2>{escape(title)}</h2>\n"
        html_content += f"<p>{escape(description)}</p>\n"
        
        for idx, (subtitle, filepath) in enumerate(files):
            html_content += f"<h3>{escape(subtitle)}</h3>\n"
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        code = f.read()
                    html_content += f"<pre>{escape(code)}</pre>\n"
                except Exception as e:
                    html_content += f"<p><i>Error reading file: {escape(str(e))}</i></p>\n"
            else:
                html_content += f"<p><i>File not found: {escape(filepath)}</i></p>\n"
                
    # Appendix A
    add_appendix(
        "Appendix A: Frontend Application Source Code (React)",
        "This appendix contains the core frontend implementation of the SIWES Management System.",
        [
            ("A.1 Main Application Component (src/App.tsx)", "src/App.tsx"),
            ("A.2 Global Styles (src/index.css)", "src/index.css"),
            ("A.3 Entry Point (src/main.tsx)", "src/main.tsx")
        ]
    )
    
    html_content += '<div class="page-break"></div>\n'
    
    # Appendix B
    add_appendix(
        "Appendix B: Backend Server Source Code (Node.js)",
        "This appendix contains the backend server implementation handling API requests and database interactions.",
        [
            ("B.1 Express Server (server.ts)", "server.ts")
        ]
    )
    
    html_content += '<div class="page-break"></div>\n'
    
    # Appendix C
    add_appendix(
        "Appendix C: AI Placement Engine Source Code (Python)",
        "This appendix contains the AI-powered recommendation engine script.",
        [
            ("C.1 AI Engine (ai_engine.py)", "ai_engine.py")
        ]
    )
    
    html_content += '<div class="page-break"></div>\n'
    
    # Appendix D
    add_appendix(
        "Appendix D: Database Seeding Scripts",
        "This appendix contains the scripts used to seed the database with mock companies.",
        [
            ("D.1 Database Seeder (seed_real_companies.ts)", "seed_real_companies.ts")
        ]
    )

    html_content += """
</body>
</html>"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Generated {output_path}")

if __name__ == "__main__":
    generate_appendix()
