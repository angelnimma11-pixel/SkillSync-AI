import pandas as pd

from skill_gap import calculate_skill_gap
from job_matcher import get_job, get_required_skills
from course_recommender import recommend_courses


def analyze_career(student_skills, job_title):

    # Find job
    job = get_job(job_title)

    if job is None:
        return None

    # Get required skills
    required_skills = get_required_skills(job)

    # Calculate gap
    matched, missing, readiness = calculate_skill_gap(
        student_skills,
        required_skills
    )

    # Recommend courses
    recommendations = recommend_courses(missing)

    return {
        "job_title": job["job_title"],
        "company": job["company"],
        "required_skills": required_skills,
        "matched_skills": list(matched),
        "missing_skills": list(missing),
        "readiness": readiness,
        "recommendations": recommendations
    }


if __name__ == "__main__":

    student_skills = [
        "Python",
        "SQL",
        "Excel"
    ]

    result = analyze_career(
        student_skills,
        "Data Analyst"
    )

    print("\n================================")
    print("       SKILLSYNC AI")
    print("================================")

    print("\nTarget Role:")
    print(result["job_title"])

    print("\nCompany:")
    print(result["company"])

    print("\nMatched Skills:")

    for skill in result["matched_skills"]:
        print("✓", skill)

    print("\nMissing Skills:")

    for skill in result["missing_skills"]:
        print("✗", skill)

    print(
        f"\nJob Readiness: {result['readiness']:.2f}%"
    )

    print("\nRecommended Courses:")

    for course in result["recommendations"]:

        print(
            f"→ {course['course']} "
            f"({course['duration']} weeks)"
        )