import pandas as pd
from pathlib import Path
import requests
import re
import json
from html import unescape


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "industry_demand.csv"

HOPIN_JOBS_URL = "https://api.hopinjobs.com/api/jobs"


def fetch_hopin_jobs():
    try:
        response = requests.get(
            HOPIN_JOBS_URL,
            params={"is_unofficial": "true"},
            timeout=10
        )
        response.raise_for_status()

        data = response.json()
        jobs = data.get("jobs", [])

        if isinstance(jobs, list) and jobs:
            return jobs

        print("Hopin API returned no jobs. Trying website fallback...")

    except requests.RequestException as error:
        print(f"Hopin API error: {error}")
    except ValueError as error:
        print(f"Hopin JSON error: {error}")

    return fetch_hopin_web_jobs()
def calculate_posted_days(posted_at):
    if not posted_at:
        return 30

    try:
        from datetime import datetime, timezone

        posted_time = datetime.fromisoformat(
            posted_at.replace("Z", "+00:00")
        )

        now = datetime.now(timezone.utc)

        days = (now - posted_time).total_seconds() / 86400

        return max(0, int(days))

    except (ValueError, TypeError):
        return 30
def fetch_hopin_web_jobs():
    try:
        url = "https://hopinjobs.com/auto-apply-jobs"

        response = requests.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html"
            },
            timeout=15
        )
        response.raise_for_status()

        html = response.text

        pattern = re.compile(
            r'<a class="job" href="(?P<href>/jobs/[^"]+)"'
            r'[^>]*data-hopin-company="(?P<company>[^"]*)"'
            r'[^>]*>.*?'
            r'<span class="t">(?P<title>.*?)</span>'
            r'.*?'
            r'<span class="m">(?P<meta>.*?)</span>',
            re.DOTALL
        )

        matches = pattern.findall(html)

        jobs = []

        for href, company, title, meta in matches:
            title = re.sub(r"<[^>]+>", "", title).strip()
            title = unescape(title)

            company = unescape(company).strip()

            meta_text = re.sub(r"<[^>]+>", " ", meta)
            meta_text = unescape(meta_text)
            meta_text = " ".join(meta_text.split())

            location = ""

            location_match = re.search(
                r'<span class="co">.*?</span>\s*(?:·\s*)?([^·<]+?)(?:\s*·\s*posted|\s*posted)',
                meta,
                re.DOTALL
            )

            if location_match:
                location = unescape(
                    location_match.group(1)
                ).strip()

            if location.lower() == "remote":
                location = "Remote"

            posted_match = re.search(
                r"posted\s+(\d{4}-\d{2}-\d{2})",
                meta_text,
                re.IGNORECASE
            )

            posted_at = (
                posted_match.group(1)
                if posted_match
                else None
            )

            job_url = f"https://hopinjobs.com{href}"

            description = ""
            job_company = company
            job_title = title
            job_posted_at = posted_at
            job_work_type = None
            job_location = location

            try:
                job_response = requests.get(
                    job_url,
                    headers={
                        "User-Agent": "Mozilla/5.0",
                        "Accept": "text/html"
                    },
                    timeout=10
                )
                job_response.raise_for_status()

                job_html = job_response.text

                json_match = re.search(
                    r'<script type="application/ld\+json">(.*?)</script>',
                    job_html,
                    re.DOTALL
                )

                if json_match:
                    job_data = json.loads(
                        unescape(json_match.group(1))
                    )

                    if job_data.get("@type") == "JobPosting":
                        job_title = job_data.get(
                            "title",
                            job_title
                        )

                        description = job_data.get(
                            "description",
                            ""
                        )

                        job_posted_at = job_data.get(
                            "datePosted",
                            job_posted_at
                        )

                        organization = job_data.get(
                            "hiringOrganization",
                            {}
                        )

                        if isinstance(organization, dict):
                            job_company = organization.get(
                                "name",
                                job_company
                            )

                        employment_type = job_data.get(
                            "employmentType"
                        )

                        if employment_type:
                            job_work_type = employment_type

                        job_location_data = job_data.get(
                            "jobLocation",
                            {}
                        )

                        if isinstance(job_location_data, dict):
                            address = job_location_data.get(
                                "address",
                                {}
                            )

                            if isinstance(address, dict):
                                city = address.get(
                                    "addressLocality"
                                )

                                if city:
                                    job_location = city

            except requests.RequestException as error:
                print(
                    f"Hopin job page error for {job_url}: {error}"
                )

            except (ValueError, json.JSONDecodeError) as error:
                print(
                    f"Hopin job JSON error for {job_url}: {error}"
                )

            jobs.append({
                "id": href.split("/")[-1],
                "company": job_company,
                "title": job_title,
                "description": description,
                "location": job_location,
                "work_type": job_work_type,
                "industry": None,
                "role_type": None,
                "ctc_amount": None,
                "posted_at": job_posted_at,
                "posted_days": calculate_posted_days(job_posted_at),
                "is_active": True,
                "job_type": "Job",
                "url": job_url
            })

        print(
            f"Hopin website fallback found {len(jobs)} jobs."
        )

        return jobs

    except requests.RequestException as error:
        print(
            f"Hopin website fallback error: {error}"
        )
        return []
def load_industry_data():
    return pd.read_csv(DATA_PATH)
def get_hopin_job_summary():
    report_url = "https://hopinjobs.com/reports/fresher-hiring-india.json"

    try:
        response = requests.get(
            report_url,
            timeout=10
        )
        response.raise_for_status()

        data = response.json()

        totals = data.get("totals", {})
        top_companies = data.get("topCompanies", [])
        top_locations = data.get("topCities", [])
        top_roles = data.get("topRoles", [])

        return {
            "success": True,
            "source": "Hopin",
            "total_jobs": totals.get("liveListings", 0),
            "top_companies": [
                {
                    "company": item.get("company"),
                    "job_count": item.get("count", 0)
                }
                for item in top_companies
            ],
            "top_locations": [
                {
                    "location": item.get("label"),
                    "job_count": item.get("count", 0)
                }
                for item in top_locations
            ],
            "top_roles": [
                {
                    "role": item.get("label"),
                    "job_count": item.get("count", 0)
                }
                for item in top_roles
            ]
        }

    except requests.RequestException as error:
        print(f"Hopin hiring report error: {error}")

        return {
            "success": False,
            "source": "Hopin",
            "total_jobs": 0,
            "top_companies": [],
            "top_locations": [],
            "top_roles": [],
            "message": "Hopin hiring data is temporarily unavailable."
        }

    except ValueError as error:
        print(f"Hopin hiring report JSON error: {error}")

        return {
            "success": False,
            "source": "Hopin",
            "total_jobs": 0,
            "top_companies": [],
            "top_locations": [],
            "top_roles": [],
            "message": "Hopin hiring data could not be read."
        }
def get_industry_demand():
    df = load_industry_data()

    records = df.to_dict(orient="records")

    return {
        "success": True,
        "total_skills": len(records),
        "skills": records
    }


def get_emerging_skills():
    df = load_industry_data()

    emerging = df[df["status"] == "Emerging"]
    emerging = emerging.sort_values(
        by="growth_rate",
        ascending=False
    )

    return {
        "success": True,
        "emerging_skills": emerging.to_dict(orient="records")
    }


# =========================================================
# STEP 16A - SMART SKILL-GAP PRIORITIZATION
# =========================================================

def prioritize_missing_skills(missing_skills):
    df = load_industry_data()

    priorities = []

    for skill in missing_skills:

        # Support both string and dictionary skill formats
        if isinstance(skill, dict):
            skill_name = (
                skill.get("skill")
                or skill.get("required_skill")
                or skill.get("name")
                or ""
            )
        else:
            skill_name = str(skill)

        skill_name = skill_name.strip()

        # Find skill in industry dataset
        match = df[
            df["skill"].str.lower() == skill_name.lower()
        ]

        if match.empty:
            priorities.append({
                "skill": skill_name,
                "demand_score": 0,
                "growth_rate": 0,
                "job_count": 0,
                "priority_score": 0,
                "priority": "Low",
                "reason": "Industry data not available"
            })
            continue

        data = match.iloc[0]

        demand = float(data["demand_score"])
        growth = float(data["growth_rate"])
        jobs = float(data["job_count"])

        # Normalize growth rate
        max_growth = float(df["growth_rate"].max())
        growth_score = (
            (growth / max_growth) * 100
            if max_growth > 0
            else 0
        )

        # Normalize job count
        max_jobs = float(df["job_count"].max())
        job_score = (
            (jobs / max_jobs) * 100
            if max_jobs > 0
            else 0
        )

        # Priority calculation
        priority_score = (
            (demand * 0.40) +
            (growth_score * 0.30) +
            (job_score * 0.20) +
            (100 * 0.10)
        )

        priority_score = round(priority_score, 2)

        # Priority category
        if priority_score >= 80:
            priority = "Critical"
        elif priority_score >= 65:
            priority = "High"
        elif priority_score >= 45:
            priority = "Medium"
        else:
            priority = "Low"

        # Explanation
        if priority == "Critical":
            reason = (
                "Very strong industry demand and growth. "
                "Recommended to learn immediately."
            )
        elif priority == "High":
            reason = (
                "Strong industry demand and good growth. "
                "Should be prioritized in the learning roadmap."
            )
        elif priority == "Medium":
            reason = (
                "Useful industry skill with moderate demand. "
                "Recommended after higher-priority skills."
            )
        else:
            reason = (
                "Lower current priority compared with other "
                "missing skills."
            )

        priorities.append({
            "skill": skill_name,
            "demand_score": demand,
            "growth_rate": growth,
            "job_count": int(jobs),
            "priority_score": priority_score,
            "priority": priority,
            "reason": reason
        })

    # Highest priority first
    priorities.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    return priorities
if __name__ == "__main__":
    jobs = fetch_hopin_jobs()

    print("\nHopin jobs fetched:", len(jobs))

    for job in jobs[:5]:
        print(
            job.get("company"),
            "-",
            job.get("title"),
            "-",
            job.get("location")
        )