import pandas as pd

skills = pd.read_csv("data/skills.csv")
jobs = pd.read_csv("data/jobs.csv")
courses = pd.read_csv("data/courses.csv")

print("\n===== SKILLS =====")
print(skills.head())

print("\n===== JOBS =====")
print(jobs.head())

print("\n===== COURSES =====")
print(courses.head())

print("\nNumber of skills:", len(skills))
print("Number of jobs:", len(jobs))
print("Number of courses:", len(courses))