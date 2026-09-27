import re
from datetime import datetime


SKILL_ALIASES = {
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",

    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",

    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "generative ai": "Generative AI",
    "nlp": "Natural Language Processing",

    "pandas": "Pandas",
    "numpy": "NumPy",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",

    "react": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "angular": "Angular",
    "vue": "Vue.js",
    "html": "HTML",
    "css": "CSS",

    "rest api": "REST API",
    "rest apis": "REST API",
    "restful api": "REST API",
    "api": "API",
    "postman": "Postman",

    "git": "Git",
    "github": "GitHub",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",

    "power bi": "Power BI",
    "tableau": "Tableau",
    "data visualization": "Data Visualization",
    "statistics": "Statistics",

    "excel": "Excel",
    "figma": "Figma",
    "linux": "Linux",

    "spring boot": "Spring Boot",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",

    "c++": "C++",
    "c#": "C#",
    ".net": ".NET",
    "dotnet": ".NET",
}


def normalize_text(text):
    return str(text or "").lower()


def normalize_student_skills(student_skills):
    normalized = []

    for skill in student_skills:
        skill_text = str(skill or "").strip()

        if not skill_text:
            continue

        canonical = SKILL_ALIASES.get(
            skill_text.lower(),
            skill_text
        )

        if canonical not in normalized:
            normalized.append(canonical)

    return normalized


def extract_job_skills(job):
    """
    Extract recognizable skills from job title + description.
    """

    title = normalize_text(job.get("title"))
    description = normalize_text(job.get("description"))

    text = f"{title} {description}"

    detected_skills = []

    for alias, canonical_name in SKILL_ALIASES.items():

        pattern = (
            r"(?<![a-z0-9+#.])"
            + re.escape(alias)
            + r"(?![a-z0-9+#.])"
        )

        if re.search(pattern, text):

            if canonical_name not in detected_skills:
                detected_skills.append(canonical_name)

    return detected_skills


def calculate_skill_score(
    student_skills,
    job_skills
):
    if not job_skills:
        return 0.0

    matched = [
        skill
        for skill in job_skills
        if skill in student_skills
    ]

    return (
        len(matched)
        / len(job_skills)
    ) * 100


def calculate_title_relevance(
    student_skills,
    job
):
    """
    Measures whether the student's skills appear
    directly in the job title.

    Example:

    Python + SQL
    →
    "Python Developer"

    gets a strong title relevance signal.
    """

    title = normalize_text(
        job.get("title")
    )

    if not title:
        return 0.0

    matched_title_skills = 0

    for skill in student_skills:

        skill_lower = skill.lower()

        if skill_lower in title:
            matched_title_skills += 1

    if matched_title_skills == 0:
        return 0.0

    return (
        matched_title_skills
        / len(student_skills)
    ) * 100


def calculate_recency_score(job):
    """
    Newer jobs receive a small boost.

    0 days = 100
    1 day  = 95
    7 days = 65
    14+ days = 30
    """

    try:
        posted_days = float(
            job.get("posted_days", 30)
        )
    except (TypeError, ValueError):
        posted_days = 30

    if posted_days <= 0:
        return 100.0

    if posted_days <= 1:
        return 95.0

    if posted_days <= 3:
        return 85.0

    if posted_days <= 7:
        return 70.0

    if posted_days <= 14:
        return 50.0

    return 30.0


def calculate_job_match(student_skills, job):

    student_skills = normalize_student_skills(
        student_skills
    )

    if not student_skills:
        return {
            "match_score": 0,
            "skill_score": 0,
            "title_score": 0,
            "recency_score": 0,
            "matched_skills": [],
            "missing_skills": [],
        }

    job_skills = extract_job_skills(job)

    matched_skills = [
        skill
        for skill in job_skills
        if skill in student_skills
    ]

    missing_skills = [
        skill
        for skill in job_skills
        if skill not in student_skills
    ]

    skill_score = calculate_skill_score(
        student_skills,
        job_skills
    )

    title_score = calculate_title_relevance(
        student_skills,
        job
    )

    recency_score = calculate_recency_score(
        job
    )

    # Overall relevance:
    #
    # 65% skill compatibility
    # 25% job-title relevance
    # 10% freshness
    #
    # Skill fit remains the dominant factor.
    final_score = (
        skill_score * 0.65
        + title_score * 0.25
        + recency_score * 0.10
    )

    return {
        "match_score": round(final_score, 2),
        "skill_score": round(skill_score, 2),
        "title_score": round(title_score, 2),
        "recency_score": round(recency_score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }


def rank_jobs(student_skills, jobs, limit=10):

    ranked_jobs = []

    for job in jobs:

        if not isinstance(job, dict):
            continue

        result = calculate_job_match(
            student_skills,
            job
        )

        ranked_jobs.append({
            "job_id": job.get("id"),
            "job_url": job.get("url"),
            "company": job.get("company"),
            "title": job.get("title"),
            "description": job.get("description"),
            "location": job.get("location"),
            "work_type": job.get("work_type"),
            "industry": job.get("industry"),
            "role_type": job.get("role_type"),
            "ctc_amount": job.get("ctc_amount"),
            "posted_at": job.get("posted_at"),
            "posted_days": job.get("posted_days"),
            "is_active": job.get("is_active"),

            "match_score": result["match_score"],
            "skill_score": result["skill_score"],
            "title_score": result["title_score"],
            "recency_score": result["recency_score"],

            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
        })

    ranked_jobs.sort(
        key=lambda item: (
            item["match_score"],
            item["skill_score"],
            item["title_score"]
        ),
        reverse=True
    )

    return ranked_jobs[:limit]