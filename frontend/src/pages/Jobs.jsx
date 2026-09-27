import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function Jobs() {
  const [skills, setSkills] = useState("");
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [jobFeedback, setJobFeedback] = useState({});
const interestedCount = Object.values(jobFeedback).filter(
  (value) => value === "interested"
).length;

const notInterestedCount = Object.values(jobFeedback).filter(
  (value) => value === "not_interested"
).length;

const [searchTerm, setSearchTerm] = useState("");
const [workType, setWorkType] = useState("All");
const [minScore, setMinScore] = useState("0");
const navigate = useNavigate();

 async function loadJobs(skillsOverride = skills) {
  const cleanedSkills = skillsOverride
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (cleanedSkills.length === 0) {
      setError("Enter at least one skill.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/career/jobs?skills=${encodeURIComponent(
          cleanedSkills.join(",")
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to load jobs.");
      }

      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (err) {
      setError(
        err.message ||
        "Unable to load live jobs."
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedFeedback = localStorage.getItem(
  "skillsync_job_feedback"
);

if (savedFeedback) {
  try {
    setJobFeedback(JSON.parse(savedFeedback));
  } catch {
    setJobFeedback({});
  }
}
    const savedProgress = localStorage.getItem(
      "skillsync_progress"
    );

    if (!savedProgress) {
      return;
    }

    try {
      const progress = JSON.parse(
        savedProgress
      );

      const matched = progress.matched_skills || [];

      const skillNames = matched
        .map(
          (item) =>
            item.student_skill ||
            item.required_skill ||
            item.skill
        )
        .filter(Boolean);

    if (skillNames.length > 0) {
  const savedSkills = [...new Set(skillNames)].join(", ");

  setSkills(savedSkills);
}
    } catch {
      // Ignore invalid saved progress.
    }
  }, []);
  function handleJobFeedback(jobId, feedback) {
  const updatedFeedback = {
    ...jobFeedback,
    [jobId]: feedback,
  };

  setJobFeedback(updatedFeedback);

  localStorage.setItem(
    "skillsync_job_feedback",
    JSON.stringify(updatedFeedback)
  );
}
function handleLearningPlan(job) {
  const missingSkills = job.missing_skills || [];

 localStorage.setItem(
  "skillsync_job_learning",
  JSON.stringify({
    job_id: job.job_id,
    company: job.company,
    title: job.title,
    missing_skills: missingSkills,
    recommendations: job.recommendations || [],
  })
);
}
 const filteredJobs = jobs
  .filter((job) => {
  const search = searchTerm
    .trim()
    .toLowerCase();

  const matchesSearch =
    !search ||
    String(job.title || "")
      .toLowerCase()
      .includes(search) ||
    String(job.company || "")
      .toLowerCase()
      .includes(search) ||
    String(job.location || "")
      .toLowerCase()
      .includes(search);

  const matchesWorkType =
    workType === "All" ||
    String(job.work_type || "")
      .toLowerCase() ===
      workType.toLowerCase();

  const matchesScore =
    Number(job.match_score || 0) >=
    Number(minScore);

     return (
      matchesSearch &&
      matchesWorkType &&
      matchesScore
    );
  })
  .sort((a, b) => {
    const feedbackScore = (job) => {
      if (jobFeedback[job.job_id] === "interested") {
        return 5;
      }

      if (jobFeedback[job.job_id] === "not_interested") {
        return -5;
      }

      return 0;
    };

    return feedbackScore(b) - feedbackScore(a);
  });

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            LIVE JOB MARKET
          </div>

          <h1 style={titleStyle}>
            Jobs Matched to Your Skills
          </h1>

          <p style={subtitleStyle}>
            Discover live opportunities ranked by
            skill compatibility, title relevance,
            and job freshness.
          </p>
        </div>
      </div>
{(interestedCount > 0 || notInterestedCount > 0) && (
  <div style={feedbackSummaryStyle}>
    <strong>Your Job Feedback</strong>

    <span>
      👍 Interested: {interestedCount}
    </span>

    <span>
      👎 Not Interested: {notInterestedCount}
    </span>
  </div>
)}
{(interestedCount > 0 || notInterestedCount > 0) && (
  <div style={feedbackSignalStyle}>
    <strong>AI Feedback Signal</strong>

    <p>
      Your job interactions are being captured as recommendation
      signals. Future matching can use these preferences to make
      job suggestions more personalized.
    </p>
  </div>
)}
      <div style={searchCardStyle}>
  <label style={labelStyle}>
    Your skills
  </label>

  <div style={searchRowStyle}>
    <input
      value={skills}
      onChange={(event) =>
        setSkills(event.target.value)
      }
     
      aria-label="Enter your skills for job matching"
      style={inputStyle}
    />

    <button
  type="button"
  onClick={() => loadJobs()}
  disabled={loading}
  style={buttonStyle}
>
      {loading
        ? "Finding Jobs..."
        : "Find Jobs"}
    </button>
  </div>

  <p style={hintStyle}>
    Separate multiple skills with commas.
  </p>
</div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        jobs.length === 0 && (
          <div style={emptyStyle}>
            <div style={emptyIconStyle}>
              🔎
            </div>

            <h2 style={emptyTitleStyle}>
              Find your matching jobs
            </h2>

            <p style={emptyTextStyle}>
              Enter your skills above to discover
              live opportunities.
            </p>
          </div>
        )}

      {loading && (
        <div style={emptyStyle}>
          <div style={emptyIconStyle}>
            ⏳
          </div>

          <h2 style={emptyTitleStyle}>
            Finding relevant jobs...
          </h2>

          <p style={emptyTextStyle}>
            SkillSync is analyzing live job listings.
          </p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <>
        <div style={filtersStyle}>

  <input
    value={searchTerm}
    onChange={(event) =>
      setSearchTerm(event.target.value)
    }
    aria-label="Search jobs or companies"
    placeholder="Search jobs or companies..."
    style={filterInputStyle}
  />

  <select
    value={workType}
    onChange={(event) =>
      setWorkType(event.target.value)
    }
    aria-label="Filter jobs by work type"
    style={selectStyle}
  >
    <option value="All">
      All work types
    </option>

    <option value="Remote">
      Remote
    </option>

    <option value="On-site">
      On-site
    </option>

    <option value="Hybrid">
      Hybrid
    </option>
  </select>

  <select
    value={minScore}
    onChange={(event) =>
      setMinScore(event.target.value)
    }
    aria-label="Filter jobs by candidate fit"
    style={selectStyle}
  >
    <option value="0">
  Any candidate fit
</option>

<option value="50">
  50%+ candidate fit
</option>

<option value="70">
  70%+ candidate fit
</option>

<option value="80">
  80%+ candidate fit
</option>

<option value="90">
  90%+ candidate fit
</option>
  </select>

</div>
          <div style={resultsHeaderStyle}>
            <div>
              <h2 style={resultsTitleStyle}>
                Recommended Opportunities
              </h2>

              <p style={resultsSubtitleStyle}>
                {filteredJobs.length} relevant jobs found
              </p>
            </div>
          </div>

          <div style={jobsGridStyle}>
{filteredJobs.map((job, index) => (
<JobCard
  key={job.job_id}
  job={job}
  isBestMatch={index === 0}
  feedback={jobFeedback[job.job_id]}
  onFeedback={handleJobFeedback}
  onLearningPlan={handleLearningPlan}
  navigate={navigate}
/>
))}
          </div>
        </>
      )}
    </div>
  );
}

function JobCard({
  job,
  isBestMatch,
  feedback,
  onFeedback,
  onLearningPlan,
  navigate,
}) {
  const score = Number(
    job.match_score || 0
  );
  let fitStatus = "Develop Skills";

if (score >= 80) {
  fitStatus = "Strong Fit";
} else if (score >= 60) {
  fitStatus = "Potential Fit";
}

  const matchedSkills =
    job.matched_skills || [];

  const missingSkills =
    job.missing_skills || [];

  return (
    <div style={jobCardStyle}>

      <div style={jobTopStyle}>
        <div>
          <h3 style={jobTitleStyle}>
            {job.title || "Untitled Role"}
          </h3>

          <div style={companyStyle}>
            {job.company || "Company not specified"}
          </div>
        </div>
<div style={scoreStyle}>
  {isBestMatch && (
    <div style={bestMatchBadgeStyle}>
      BEST MATCH
    </div>
  )}

  <div style={fitStatusStyle}>
    {fitStatus}
  </div>
{feedback === "interested" && (
  <div style={feedbackIndicatorStyle}>
    👍 You marked this as relevant
  </div>
)}

{feedback === "not_interested" && (
  <div style={feedbackIndicatorStyle}>
    👎 You marked this as not relevant
  </div>
)}
  <strong>
    {score}%
  </strong>

  <span>
    Match
  </span>
</div>
      </div>

      <div style={metaRowStyle}>
        {job.location && (
          <span style={metaStyle}>
            📍 {job.location}
          </span>
        )}

        {job.work_type && (
          <span style={metaStyle}>
            💼 {job.work_type}
          </span>
        )}

        {job.posted_days !== undefined && (
          <span style={metaStyle}>
            🕒 {job.posted_days}d ago
          </span>
        )}
      </div>
      {job.description && (
  <div style={descriptionStyle}>
    <div style={sectionLabelStyle}>
      Role Overview
    </div>

    <p>
      {job.description
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 220)}
      {job.description.replace(/<[^>]*>/g, " ").trim().length > 220
        ? "..."
        : ""}
    </p>
  </div>
)}

      {matchedSkills.length > 0 && (
        <div style={skillsSectionStyle}>
          <div style={sectionLabelStyle}>
            Matched Skills
          </div>

          <div style={chipsStyle}>
            {matchedSkills.map(
              (skill) => (
                <span
                  key={skill}
                  style={matchedChipStyle}
                >
                  ✓ {skill}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div style={skillsSectionStyle}>
          <div style={sectionLabelStyle}>
            Skills to Develop
          </div>

          <div style={chipsStyle}>
            {missingSkills.map(
              (skill) => (
                <span
                  key={skill}
                  style={missingChipStyle}
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      )}

      <div style={scoreBreakdownStyle}>
        <div>
          <span>Skill Match</span>
          <strong>
            {job.skill_score ?? 0}%
          </strong>
        </div>

        <div>
          <span>Title Relevance</span>
          <strong>
            {job.title_score ?? 0}%
          </strong>
        </div>

        <div>
          <span>Freshness</span>
          <strong>
            {job.recency_score ?? 0}%
          </strong>
        </div>
      </div>
      <div style={matchReasonStyle}>
  <strong>Why this job matches you</strong>

  <p>
    {matchedSkills.length > 0
      ? `Your skills match ${matchedSkills.length} key skill${
          matchedSkills.length > 1 ? "s" : ""
        } mentioned in this job.`
      : "This opportunity has limited direct skill overlap with your profile."}
  </p>

  {score >= 70 && (
    <span>
      Strong overall compatibility based on your skills and the job role.
    </span>
  )}

  {score >= 50 && score < 70 && (
    <span>
      Moderate compatibility. Consider developing the missing skills shown above.
    </span>
  )}

  {score < 50 && (
    <span>
      Lower compatibility right now, but this role can highlight useful skills to develop.
    </span>
  )}
</div>
<div style={candidateFitStyle}>
  <strong>Candidate Fit Summary</strong>

  <div>
    <span>Skills matched: </span>
    <strong>{matchedSkills.length}</strong>
  </div>

  <div>
    <span>Skills to develop: </span>
    <strong>{missingSkills.length}</strong>
  </div>

  <div>
    <span>Overall fit: </span>
    <strong>{score}%</strong>
  </div>
</div>
<div style={feedbackStyle}>
  <span>Was this job relevant?</span>

  <div style={feedbackButtonsStyle}>
    <button
      type="button"
      aria-label={`Mark ${job.title || "this job"} as interested`}
      onClick={() =>
        onFeedback(job.job_id, "interested")
      }
      style={{
        ...feedbackButtonStyle,
        ...(feedback === "interested"
          ? feedbackActiveStyle
          : {}),
      }}
    >
      👍 Interested
    </button>

    <button
      type="button"
      aria-label={`Mark ${job.title || "this job"} as not interested`}
      onClick={() =>
        onFeedback(job.job_id, "not_interested")
      }
      style={{
        ...feedbackButtonStyle,
        ...(feedback === "not_interested"
          ? feedbackInactiveStyle
          : {}),
      }}
    >
      👎 Not Interested
    </button>
  </div>
</div>
{job.job_url && (
  <a
    href={job.job_url}
    target="_blank"
    rel="noopener noreferrer"
    style={jobLinkStyle}
  >
    View Job ↗
  </a>
)}
{job.missing_skills && job.missing_skills.length > 0 && (
  <button
    type="button"
  onClick={() => {
  onLearningPlan(job);
  navigate("/roadmap");
}}
    style={{
      display: "inline-block",
      marginTop: "10px",
      marginLeft: "8px",
      padding: "10px 14px",
      borderRadius: "9px",
      fontWeight: 700,
      fontSize: "13px",
      border: "1px solid #5546e8",
      background: "#5546e8",
      color: "white",
      cursor: "pointer",
    }}
  >
    Build Learning Plan →
  </button>
)}
      <div style={footerStyle}>
        <span style={sourceStyle}>
          Live opportunity
        </span>

        <span style={roleStyle}>
          {job.role_type || "Job"}
        </span>
      </div>

    </div>
  );
}


const pageStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "48px 24px 80px",
};

const headerStyle = {
  marginBottom: "32px",
};

const eyebrowStyle = {
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "38px",
  margin: "0 0 10px",
};

const subtitleStyle = {
  margin: 0,
  maxWidth: "700px",
  lineHeight: 1.6,
};

const searchCardStyle = {
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
  marginBottom: "30px",
};

const labelStyle = {
  display: "block",
  fontWeight: 700,
  marginBottom: "10px",
};

const searchRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const inputStyle = {
  flex: 1,
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
};

const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "14px 22px",
  fontWeight: 700,
  cursor: "pointer",
};

const hintStyle = {
  fontSize: "13px",
  marginTop: "8px",
};

const errorStyle = {
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "24px",
  border: "1px solid #fecaca",
};

const emptyStyle = {
  textAlign: "center",
  padding: "70px 20px",
};

const emptyIconStyle = {
  fontSize: "38px",
  marginBottom: "12px",
};

const emptyTitleStyle = {
  margin: "0 0 8px",
};

const emptyTextStyle = {
  margin: 0,
};

const resultsHeaderStyle = {
  marginBottom: "20px",
};

const resultsTitleStyle = {
  margin: 0,
};

const resultsSubtitleStyle = {
  margin: "5px 0 0",
};

const jobsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const jobCardStyle = {
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
};

const jobTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
};

const jobTitleStyle = {
  margin: 0,
  fontSize: "20px",
};

const companyStyle = {
  marginTop: "6px",
};

const scoreStyle = {
  minWidth: "70px",
  textAlign: "right",
};

const metaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "18px",
};

const metaStyle = {
  fontSize: "13px",
};

const skillsSectionStyle = {
  marginTop: "20px",
};

const sectionLabelStyle = {
  fontSize: "12px",
  fontWeight: 700,
  marginBottom: "8px",
  textTransform: "uppercase",
};

const chipsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "7px",
};

const matchedChipStyle = {
  padding: "6px 9px",
  borderRadius: "999px",
  fontSize: "12px",
};

const missingChipStyle = {
  padding: "6px 9px",
  borderRadius: "999px",
  fontSize: "12px",
};

const scoreBreakdownStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, 1fr)",
  gap: "8px",
  marginTop: "22px",
  paddingTop: "16px",
  borderTop: "1px solid #eee",
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
  paddingTop: "14px",
  borderTop: "1px solid #eee",
  fontSize: "12px",
};

const sourceStyle = {
  fontWeight: 700,
};

const roleStyle = {
  opacity: 0.7,
};const matchReasonStyle = {
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "12px",
  background: "#f8f9ff",
  border: "1px solid #e5e7eb",
};
const candidateFitStyle = {
  marginTop: "12px",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  fontSize: "13px",
  lineHeight: 1.8,
};

candidateFitStyle.display = "block";

matchReasonStyle.display = "block";

const filtersStyle = {
  display: "grid",
 gridTemplateColumns:
  "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "22px",
};

const filterInputStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const selectStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  fontSize: "14px",
};
const bestMatchBadgeStyle = {
  display: "inline-block",
  marginBottom: "6px",
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#dcfce7",
  color: "#15803d",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.5px",
};
const fitStatusStyle = {
  marginBottom: "6px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.3px",
};
const feedbackStyle = {
  marginTop: "18px",
  paddingTop: "14px",
  borderTop: "1px solid #eee",
};

const feedbackButtonsStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "9px",
  flexWrap: "wrap",
};

const feedbackButtonStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "7px 10px",
  background: "white",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const feedbackActiveStyle = {
  background: "#dcfce7",
  borderColor: "#86efac",
  color: "#15803d",
};

const feedbackInactiveStyle = {
  background: "#fee2e2",
  borderColor: "#fca5a5",
  color: "#b91c1c",
};
const feedbackSummaryStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
  padding: "14px 18px",
  borderRadius: "12px",
  background: "#f8f9ff",
  border: "1px solid #e5e7eb",
  fontSize: "13px",
};
const feedbackSignalStyle = {
  marginBottom: "24px",
  padding: "16px 18px",
  borderRadius: "12px",
  background: "#f5f3ff",
  border: "1px solid #ddd6fe",
};
const jobLinkStyle = {
  display: "inline-block",
  marginTop: "16px",
  padding: "10px 14px",
  borderRadius: "9px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "13px",
  border: "1px solid #d1d5db",
};
const feedbackIndicatorStyle = {
  marginTop: "8px",
  fontSize: "11px",
  fontWeight: 600,
};
const descriptionStyle = {
  marginTop: "18px",
  lineHeight: 1.6,
  fontSize: "13px",
};
feedbackSignalStyle.color = "#4c1d95";
export default Jobs;