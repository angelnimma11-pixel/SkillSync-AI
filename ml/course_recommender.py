from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
COURSES_FILE = BASE_DIR / "data" / "courses.csv"

courses = pd.read_csv(COURSES_FILE)


def recommend_courses(missing_skills, skill_priorities=None):

    recommendations = []

    # Create priority lookup
    priority_lookup = {}

    if skill_priorities:

        for item in skill_priorities:

            if not isinstance(item, dict):
                continue

            skill_name = item.get("skill")

            if skill_name:
                priority_lookup[
                    skill_name.strip().lower()
                ] = item

    # Evaluate every course
    for _, course in courses.iterrows():

        course_skills = [
            skill.strip().lower()
            for skill in str(course["skills"]).split(";")
        ]

        matched_skills = []

        for skill in missing_skills:

            if skill.lower() in course_skills:
                matched_skills.append(skill)

        # Ignore courses that don't teach
        # any missing skill
        if not matched_skills:
            continue

        # Calculate course relevance
        skill_scores = []

        for skill in matched_skills:

            priority_data = priority_lookup.get(
                skill.lower()
            )

            if priority_data:

                score = float(
                    priority_data.get(
                        "priority_score",
                        0
                    )
                )

            else:

                score = 0.0

            skill_scores.append(score)

        # Base relevance:
        # more missing skills covered = better
        coverage_score = (
            len(matched_skills)
            / max(len(missing_skills), 1)
        ) * 100

        # Priority:
        # prioritize courses covering important gaps
        priority_score = (
            sum(skill_scores)
            / max(len(skill_scores), 1)
        )

        # Final recommendation score
        final_score = (
            coverage_score * 0.6
            + priority_score * 0.4
        )

        # Determine highest priority
        highest_priority = "Medium"

        for skill in matched_skills:

            priority_data = priority_lookup.get(
                skill.lower()
            )

            if priority_data:

                priority = priority_data.get(
                    "priority",
                    "Medium"
                )

                if priority == "High":
                    highest_priority = "High"
                    break

                if priority == "Low":
                    if highest_priority != "High":
                        highest_priority = "Low"

        recommendations.append({

            "course": course["course_name"],

            "provider": course["provider"],

            "duration": course["duration_weeks"],

            "level": course["level"],

            "skills": matched_skills,

            "coverage_score": round(
                coverage_score,
                2
            ),

            "priority_score": round(
                priority_score,
                2
            ),

            "recommendation_score": round(
                final_score,
                2
            ),

            "priority": highest_priority

        })

    # Highest recommendation score first
    recommendations.sort(
        key=lambda x: x["recommendation_score"],
        reverse=True
    )

    return recommendations