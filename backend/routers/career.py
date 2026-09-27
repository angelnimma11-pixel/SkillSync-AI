from fastapi import APIRouter

from backend.schemas.career import CareerAnalysisRequest

from ml.job_matcher import get_job, get_required_skills
from ml.semantic_gap import semantic_skill_gap
from ml.course_recommender import recommend_courses

from backend.industry import prioritize_missing_skills


router = APIRouter(
    prefix="/career",
    tags=["Career Analysis"]
)


@router.post("/analyze")
def analyze_career(request: CareerAnalysisRequest):
    if not request.target_role.strip():
        return {
            "success": False,
            "message": "Target role is required"
        }

    if len(request.student_skills) > 50:
        return {
            "success": False,
            "message": "Too many skills provided. Please enter up to 50 skills."
        }
    # Find target job
    job = get_job(request.target_role)

    if job is None:
        return {
            "success": False,
            "message": "Job role not found"
        }

    # Get required skills
    required_skills = get_required_skills(job)

    # Semantic skill-gap analysis
    matched, missing, readiness = semantic_skill_gap(
        request.student_skills,
        required_skills
    )

    # Extract missing skill names
    missing_skill_names = [
        item["skill"]
        for item in missing
    ]

    # Smart skill-gap prioritization
    skill_priorities = prioritize_missing_skills(
        missing_skill_names
    )

    # Create ordered learning sequence
    learning_sequence = sorted(
        skill_priorities,
        key=lambda item: item.get(
            "priority_score",
            0
        ),
        reverse=True
    )

    # Course recommendations
    recommendations = recommend_courses(
        missing_skill_names,
        skill_priorities
    )

    return {
        "success": True,

        "target_role": request.target_role,

        "job": {
            "title": job["job_title"],
            "company": job["company"],
            "location": job["location"]
        },

        "readiness": round(
            readiness,
            2
        ),

        "matched_skills": matched,

        "missing_skills": missing,

        "skill_priorities": skill_priorities,

        "learning_sequence": learning_sequence,

        "recommendations": recommendations
    }