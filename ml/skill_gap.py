def calculate_skill_gap(student_skills, required_skills):

    student_skills = {
        skill.lower() for skill in student_skills
    }

    required_skills = {
        skill.lower() for skill in required_skills
    }

    matched = student_skills.intersection(required_skills)

    missing = required_skills - student_skills

    readiness = (
        len(matched) / len(required_skills)
    ) * 100

    return matched, missing, readiness


if __name__ == "__main__":

    student = [
        "Python",
        "SQL",
        "Excel"
    ]

    job = [
        "Python",
        "SQL",
        "Excel",
        "Power BI",
        "Statistics"
    ]

    matched, missing, readiness = calculate_skill_gap(
        student,
        job
    )

    print("\nMatched Skills:")
    print(matched)

    print("\nMissing Skills:")
    print(missing)

    print(f"\nJob Readiness: {readiness:.2f}%")