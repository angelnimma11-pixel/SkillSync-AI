import pandas as pd


# Load jobs dataset
jobs = pd.read_csv("data/jobs.csv")


def get_job(job_title):

    # Find jobs containing the requested title
    matches = jobs[
        jobs["job_title"].str.lower().str.contains(
            job_title.lower(),
            na=False
        )
    ]

    if matches.empty:
        return None

    return matches.iloc[0]


def get_required_skills(job):

    skills = job["skills"].split(";")

    return [skill.strip() for skill in skills]


if __name__ == "__main__":

    job_title = "Data Analyst"

    job = get_job(job_title)

    if job is None:

        print("Job not found")

    else:

        print("\nJob Found:")
        print("Title:", job["job_title"])
        print("Company:", job["company"])
        print("Location:", job["location"])

        required_skills = get_required_skills(job)

        print("\nRequired Skills:")

        for skill in required_skills:
            print("✓", skill)