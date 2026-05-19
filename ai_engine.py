import json
import sys
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_score(student, company):
    """
    Calculates a recommendation score for a student against a company.
    
    Score Formula:
    - Skill Overlap: 0-60 points
    - Course Relevance: 0-30 points
    - Location Proximity: 0-10 points
    """
    
    # Extract skills (expecting lists)
    student_skills_raw = student.get('skills') or []
    student_skills = set([s.lower().strip() for s in student_skills_raw if s])
    
    company_skills_raw = company.get('required_skills') or []
    company_skills = set([s.lower().strip() for s in company_skills_raw if s])
    
    # 1. Skill overlap (0-60)
    if not company_skills:
        skill_score = 30  # Baseline if company hasn't specified skills
    else:
        matched_skills = student_skills.intersection(company_skills)
        skill_score = min(60, (len(matched_skills) / len(company_skills)) * 60)
    
    # 2. Course relevance (0-30)
    course = (student.get('course') or '').lower()
    industry = (company.get('industry_type') or '').lower()
    
    course_keywords = set(course.split())
    industry_keywords = set(industry.split())
    
    # Check for keyword intersection
    if course_keywords.intersection(industry_keywords):
        course_score = 30
    else:
        # Fallback for partial matches or general relevance
        # In a real system, this would use a mapping or NLP
        course_score = 10
        
    # 3. Location proximity (0-10)
    student_loc = (student.get('location_preference') or '').lower()
    company_loc = (company.get('address') or '').lower()
    
    student_lat = student.get('latitude')
    student_lon = student.get('longitude')
    company_lat = company.get('latitude')
    company_lon = company.get('longitude')
    
    if student_lat is not None and student_lon is not None and company_lat is not None and company_lon is not None:
        distance = haversine(student_lat, student_lon, company_lat, company_lon)
        if distance <= 10:
            location_score = 10
        elif distance <= 50:
            location_score = 7
        elif distance <= 100:
            location_score = 5
        else:
            location_score = 2
    elif student_loc and company_loc:
        if student_loc == company_loc:
            location_score = 10
        elif student_loc in company_loc or company_loc in student_loc:
            location_score = 7
        else:
            location_score = 5
    else:
        location_score = 5
        
    total = skill_score + course_score + location_score
    
    # Generate human-readable reason
    reason_parts = []
    if len(student_skills.intersection(company_skills)) > 0:
        reason_parts.append(f"Matches {len(student_skills.intersection(company_skills))} of your skills.")
    if course_score == 30:
        reason_parts.append(f"Highly relevant to your course of study ({student.get('course')}).")
    if location_score >= 7:
        reason_parts.append("Matches your preferred location.")
        
    reason = " ".join(reason_parts) if reason_parts else "General match based on industry profile."
    
    return {
        "total": round(total, 2),
        "breakdown": {
            "skillMatch": round(skill_score, 2),
            "courseMatch": round(course_score, 2),
            "locationMatch": round(location_score, 2)
        },
        "reason": reason
    }

def get_recommendations(student_data, companies_list):
    """
    Processes a list of companies and returns them ranked by score.
    """
    results = []
    for company in companies_list:
        score_data = calculate_score(student_data, company)
        # Merge company data with score data
        results.append({**company, **score_data})
        
    # Sort by total score descending
    results.sort(key=lambda x: x['total'], reverse=True)
    return results

if __name__ == "__main__":
    # CLI usage: python3 ai_engine.py '<json_input>'
    # json_input format: {"student": {...}, "companies": [...]}
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            student = input_data.get('student', {})
            companies = input_data.get('companies', [])
            
            recommendations = get_recommendations(student, companies)
            print(json.dumps(recommendations))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Example for testing
        test_student = {
            "course": "Computer Science",
            "skills": ["Python", "React", "SQL"],
            "location_preference": "Lagos"
        }
        test_companies = [
            {
                "name": "TechCorp",
                "industry_type": "Software Development",
                "required_skills": ["Python", "Django"],
                "address": "Lagos"
            },
            {
                "name": "BankOne",
                "industry_type": "Finance",
                "required_skills": ["SQL", "Java"],
                "address": "Abuja"
            }
        ]
        print(json.dumps(get_recommendations(test_student, test_companies), indent=2))
