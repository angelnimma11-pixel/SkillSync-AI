import pandas as pd
import re

skills_df = pd.read_csv("data/skills.csv")

SKILLS = skills_df["skill_name"].tolist()


def extract_skills(text):
    text = text.lower()

    found_skills = []

    for skill in SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, text):
            found_skills.append(skill)

    return found_skills


if __name__ == "__main__":

    resume_text = """
    I am a Computer Science student with experience in Python,
    SQL, Machine Learning, Pandas, NumPy and Git.
    I have developed projects using Python and Machine Learning.
    """

    skills = extract_skills(resume_text)

    print("\nDetected Skills:")
    for skill in skills:
        print("✓", skill)