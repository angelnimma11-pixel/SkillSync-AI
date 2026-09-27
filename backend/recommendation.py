from pathlib import Path
import re

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


# --------------------------------------------------
# Find jobs dataset
# --------------------------------------------------

def find_jobs_file():
    possible_files = [
        DATA_DIR / "jobs.csv",
        DATA_DIR / "job_roles.csv",
        DATA_DIR / "job_requirements.csv",
    ]

    for file in possible_files:
        if file.exists():
            return file

    return None


# --------------------------------------------------
# Skill normalization
# --------------------------------------------------

ALIASES = {
    "ml": "machine learning",
    "machinelearning": "machine learning",
    "powerbi": "power bi",
    "power-bi": "power bi",
    "msexcel": "excel",
    "microsoft excel": "excel",
    "py": "python",
    "js": "javascript",
}


def normalize_skill(skill):
    skill = str(skill).strip().lower()

    # Remove surrounding brackets/quotes
    skill = skill.strip("[](){}'\"")

    # Normalize spaces
    skill = re.sub(r"\s+", " ", skill)

    # Remove unnecessary spaces around hyphens
    skill = re.sub(r"\s*-\s*", "-", skill)

    return ALIASES.get(skill, skill)


# --------------------------------------------------
# Parse skills from CSV
# --------------------------------------------------

def parse_skills(value):
    if pd.isna(value):
        return []

    text = str(value).strip()

    # Remove brackets from list-like values
    text = text.strip("[]")

    # Split common separators
    parts = re.split(r"[,;|/\n]+", text)

    skills = []

    for part in parts:
        skill = normalize_skill(part)

        if skill:
            skills.append(skill)

    return list(set(skills))


# --------------------------------------------------
# Find important columns automatically
# --------------------------------------------------

def find_column(columns, possible_names):
    normalized_columns = {
        str(column).strip().lower(): column
        for column in columns
    }

    for name in possible_names:
        if name.lower() in normalized_columns:
            return normalized_columns[name.lower()]

    return None


# --------------------------------------------------
# Load jobs
# --------------------------------------------------

def load_jobs():
    jobs_file = find_jobs_file()

    if jobs_file is None:
        return None, None, None

    df = pd.read_csv(jobs_file)

    role_column = find_column(
        df.columns,
        [
            "job_title",
            "job title",
            "title",
            "role",
            "job",
            "position",
            "job_role",
        ],
    )

    skills_column = find_column(
        df.columns,
        [
            "required_skills",
            "required skills",
            "skills",
            "skill",
            "requirements",
            "technical_skills",
        ],
    )

    return df, role_column, skills_column


# --------------------------------------------------
# Build unique career profiles
# --------------------------------------------------

def build_career_profiles():
    df, role_column, skills_column = load_jobs()

    if df is None:
        return {}

    if role_column is None or skills_column is None:
        return {}

    careers = {}

    for _, row in df.iterrows():
        role = str(row[role_column]).strip()

        if not role or role.lower() == "nan":
            continue

        skills = parse_skills(row[skills_column])

        if role not in careers:
            careers[role] = set()

        careers[role].update(skills)

    return careers


# --------------------------------------------------
# Load industry demand
# --------------------------------------------------

def load_industry_demand():
    industry_file = DATA_DIR / "industry_demand.csv"

    if not industry_file.exists():
        return {}

    df = pd.read_csv(industry_file)

    demand_map = {}

    if "skill" not in df.columns:
        return demand_map

    for _, row in df.iterrows():
        skill = normalize_skill(row["skill"])

        try:
            demand = float(row["demand_score"])
        except (TypeError, ValueError):
            demand = 0

        demand_map[skill] = demand

    return demand_map


# --------------------------------------------------
# Load course recommendations
# --------------------------------------------------

def load_courses():
    courses_file = DATA_DIR / "courses.csv"

    if not courses_file.exists():
        return pd.DataFrame()

    try:
        return pd.read_csv(courses_file)
    except Exception:
        return pd.DataFrame()


# --------------------------------------------------
# Recommend courses for missing skills
# --------------------------------------------------

def recommend_courses(missing_skills):
    if not missing_skills:
        return []

    df = load_courses()

    if df.empty:
        return []

    skill_column = find_column(
        df.columns,
        [
            "skill",
            "skills",
            "course_skill",
            "course skills",
            "topic",
        ],
    )

    if skill_column is None:
        return []

    recommendations = []

    for missing_skill in missing_skills:
        normalized_missing = normalize_skill(missing_skill)

        for _, row in df.iterrows():
            course_skills = parse_skills(row[skill_column])

            if normalized_missing not in course_skills:
                continue

            course = {}

            for column in df.columns:
                value = row[column]

                if pd.isna(value):
                    value = ""

                course[column] = str(value)

            course["matched_skill"] = missing_skill

            recommendations.append(course)

    return recommendations[:10]


# --------------------------------------------------
# Career Recommendation Engine
# --------------------------------------------------

def recommend_careers(student_skills):
    if not student_skills.strip():
        return {
            "success": False,
            "message": "Please provide at least one skill.",
        }

    student_skill_list = parse_skills(student_skills)
    student_skill_set = set(student_skill_list)

    careers = build_career_profiles()

    if not careers:
        return {
            "success": False,
            "message": (
                "No career data could be loaded. "
                "Please check that jobs.csv exists in the data folder "
                "and contains job title and skills columns."
            ),
        }

    demand_map = load_industry_demand()

    recommendations = []

    for role, required_skills in careers.items():

        if not required_skills:
            continue

        matched = sorted(
            student_skill_set.intersection(required_skills)
        )

        missing = sorted(
            required_skills.difference(student_skill_set)
        )

        total_required = len(required_skills)

        readiness = (
            len(matched) / total_required
        ) * 100

        # --------------------------------------------------
        # Industry alignment
        # --------------------------------------------------

        demand_values = [
            demand_map[skill]
            for skill in required_skills
            if skill in demand_map
        ]

        if demand_values:
            industry_alignment = (
                sum(demand_values) / len(demand_values)
            )
        else:
            industry_alignment = 0

        # --------------------------------------------------
        # Final recommendation score
        #
        # 70% = student's readiness
        # 30% = industry demand alignment
        # --------------------------------------------------

        recommendation_score = (
            readiness * 0.70
            + industry_alignment * 0.30
        )

        # --------------------------------------------------
        # Store recommendation
        # --------------------------------------------------

        recommendations.append(
            {
                "role": role,
                "readiness": round(readiness, 2),
                "matched_skills": matched,
                "missing_skills": missing,
                "total_required_skills": total_required,
                "industry_alignment": round(
                    industry_alignment,
                    2,
                ),
                "recommendation_score": round(
                    recommendation_score,
                    2,
                ),
            }
        )

    # --------------------------------------------------
    # Rank careers
    # --------------------------------------------------

    recommendations.sort(
        key=lambda x: (
            x["recommendation_score"],
            x["readiness"],
            x["industry_alignment"],
        ),
        reverse=True,
    )

    # --------------------------------------------------
    # Add ranking
    # --------------------------------------------------

    for index, recommendation in enumerate(
        recommendations[:5],
        start=1,
    ):
        recommendation["rank"] = index

    # --------------------------------------------------
    # Final response
    # --------------------------------------------------

    return {
        "success": True,
        "student_skills": sorted(student_skill_set),
        "total_careers_analyzed": len(careers),
        "recommendations": recommendations[:5],
    }