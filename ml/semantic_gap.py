from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


model = SentenceTransformer("all-MiniLM-L6-v2")


SKILL_ALIASES = {
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "js": "javascript",
    "ts": "typescript",
    "nlp": "natural language processing",
    "dl": "deep learning",
    "db": "database",
    "dbms": "database management systems",
    "powerbi": "power bi",
    "rest": "rest api",
    "restful": "rest api",
}


def semantic_skill_gap(
    student_skills,
    required_skills,
    threshold=0.65
):

    # Clean student skills
    original_student_skills = list(dict.fromkeys(
        skill.strip()
        for skill in student_skills
        if skill and skill.strip()
    ))

    # Clean required skills
    original_required_skills = list(dict.fromkeys(
        skill.strip()
        for skill in required_skills
        if skill and skill.strip()
    ))

    # No required skills
    if not original_required_skills:
        return [], [], 100.0

    # No student skills
    if not original_student_skills:

        missing = [
            {
                "skill": skill,
                "similarity": 0.0
            }
            for skill in original_required_skills
        ]

        return [], missing, 0.0

    # Normalize aliases
    student_skills = [
        SKILL_ALIASES.get(
            skill.lower(),
            skill
        )
        for skill in original_student_skills
    ]

    required_skills_normalized = [
        SKILL_ALIASES.get(
            skill.lower(),
            skill
        )
        for skill in original_required_skills
    ]

    # Generate embeddings
    student_embeddings = model.encode(student_skills)

    required_embeddings = model.encode(
        required_skills_normalized
    )

    # Calculate every required-skill ↔ student-skill similarity
    similarity_matrix = cosine_similarity(
        required_embeddings,
        student_embeddings
    )

    # Create every possible matching pair
    possible_matches = []

    for required_index, required_skill in enumerate(
        original_required_skills
    ):

        for student_index, student_skill in enumerate(
            original_student_skills
        ):

            score = float(
                similarity_matrix[
                    required_index
                ][student_index]
            )

            possible_matches.append({
                "required_index": required_index,
                "student_index": student_index,
                "required_skill": required_skill,
                "student_skill": student_skill,
                "similarity": score
            })

    # Strongest matches first
    possible_matches.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    matched = []
    missing = []

    used_required_indices = set()
    used_student_indices = set()

    # Select globally strongest available matches
    for pair in possible_matches:

        required_index = pair["required_index"]
        student_index = pair["student_index"]
        score = pair["similarity"]

        # Skip if either skill is already matched
        if required_index in used_required_indices:
            continue

        if student_index in used_student_indices:
            continue

        # Ignore weak semantic matches
        if score < threshold:
            continue

        confidence = (
            "High"
            if score >= 0.80
            else "Medium"
        )

        matched.append({
            "required_skill": pair["required_skill"],
            "student_skill": pair["student_skill"],
            "similarity": round(score, 3),
            "confidence": confidence
        })

        used_required_indices.add(
            required_index
        )

        used_student_indices.add(
            student_index
        )

    # Required skills that were not matched
    for required_index, required_skill in enumerate(
        original_required_skills
    ):

        if required_index in used_required_indices:
            continue

        # Find the strongest student skill for
        # this required skill, even if it was already used
        best_score = float(
            similarity_matrix[
                required_index
            ].max()
        )

        missing.append({
            "skill": required_skill,
            "similarity": round(
                best_score,
                3
            )
        })

    # Weighted readiness
    if matched:

        total_similarity = sum(
            item["similarity"]
            for item in matched
        )

        readiness = (
            total_similarity
            / len(original_required_skills)
        ) * 100

    else:

        readiness = 0.0

    return matched, missing, readiness


if __name__ == "__main__":

    student_skills = [
        "Python",
        "SQL",
        "ML",
        "Pandas",
        "Git"
    ]

    required_skills = [
        "Python",
        "SQL",
        "Machine Learning",
        "Statistics",
        "Git"
    ]

    matched, missing, readiness = semantic_skill_gap(
        student_skills,
        required_skills
    )

    print("\nMATCHED SKILLS")

    for item in matched:

        print(
            f"✓ {item['required_skill']} "
            f"← {item['student_skill']} "
            f"({item['similarity']}) "
            f"[{item['confidence']}]"
        )

    print("\nMISSING SKILLS")

    for item in missing:

        print(
            f"✗ {item['skill']} "
            f"({item['similarity']})"
        )

    print(
        f"\nReadiness: {readiness:.2f}%"
    )