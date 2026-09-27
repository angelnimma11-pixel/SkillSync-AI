from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.career import router as career_router

from backend.industry import (
    get_industry_demand,
    get_emerging_skills,
    get_hopin_job_summary
)
from backend.recommendation import (
    recommend_careers
)
from ml.course_recommender import recommend_courses


app = FastAPI(
    title="SkillSync AI",
    description="AI-powered skill alignment and career intelligence platform",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Career Analysis
# --------------------------------------------------

app.include_router(career_router)


# --------------------------------------------------
# Industry Demand APIs
# --------------------------------------------------

@app.get("/industry/demand")
def industry_demand():

    return get_industry_demand()


@app.get("/industry/emerging")
def industry_emerging():

    return get_emerging_skills()
@app.get("/industry/jobs")
def industry_jobs():
    return get_hopin_job_summary()
@app.get("/career/jobs")
def career_jobs(skills: str):
    student_skills = [
        skill.strip()
        for skill in skills.split(",")
        if skill.strip()
    ]

    from backend.industry import fetch_hopin_jobs
    from backend.job_matching import rank_jobs

    jobs = fetch_hopin_jobs()

    ranked_jobs = rank_jobs(
        student_skills,
        jobs,
        limit=10
    )

    for job in ranked_jobs:
        job["recommendations"] = recommend_courses(
            job.get("missing_skills", [])
        )

    return {
        "success": True,
        "student_skills": student_skills,
        "jobs": ranked_jobs
    }
    


# --------------------------------------------------
# Career Recommendation API
# --------------------------------------------------

@app.get("/career/recommend")
def career_recommend(skills: str):

    return recommend_careers(skills)


# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "SkillSync AI Backend is running!"
    }