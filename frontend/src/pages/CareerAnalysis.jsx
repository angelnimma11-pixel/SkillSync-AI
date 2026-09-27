import { useState } from "react";
import { Link } from "react-router-dom";

function CareerAnalysis() {
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] =
    useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const analyzeCareer = async () => {
    setError("");
    setResult(null);
 if (!targetRole.trim()) {
    setError("Target role is required");
    return;
  }
  if (targetRole.trim().length > 100) {
  setError("Target role must be 100 characters or fewer.");
  return;
}
    const studentSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (studentSkills.length === 0) {
      setError("Please enter at least one skill.");
      return;
    }
if (studentSkills.some((skill) => skill.length > 50)) {
  setError("Each skill must be 50 characters or fewer.");
  return;
}
    setLoading(true);

    try {
      const response = await fetch(
       `${API_BASE}/career/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_skills: studentSkills,
            target_role: targetRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Career analysis failed."
        );
      }

      setResult(data);

      localStorage.setItem(
        "skillsync_progress",
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(error);

     setError("Unable to connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const matchedSkills = Array.isArray(
    result?.matched_skills
  )
    ? result.matched_skills
    : [];

  const missingSkills = Array.isArray(
    result?.missing_skills
  )
    ? result.missing_skills
    : [];

  const readiness = Number(
    result?.readiness ??
      result?.readiness_score ??
      result?.job_readiness ??
      0
  );

  return (
    <main
      style={{
        padding: "70px 8%",
        background: "#f8f9ff",
        minHeight: "80vh",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <div style={{ marginBottom: "30px" }}>
          <span style={{ color: "#5546e8", fontWeight: "700" }}>
            CAREER INTELLIGENCE
          </span>

          <h1>Know where you stand.</h1>

          <p style={{ color: "#6b7280" }}>
            Enter your skills and target career to analyze
            your career readiness.
          </p>
        </div>

        <div
          style={{
  background: "white",
  padding: "35px",
  borderRadius: "20px",
  border: "1px solid #eef0f6",
  boxShadow: "0 12px 35px rgba(0,0,0,0.06)",
}}
        >
          <label>Your Skills</label>

          <input
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
            placeholder="Python, SQL, Excel, Machine Learning..."
            style={inputStyle}
          />

          <small>
            Separate multiple skills using commas.
          </small>

          <div style={{ marginTop: "25px" }}>
            <label>Target Career</label>

            <input
              value={targetRole}
              onChange={(e) =>
                setTargetRole(e.target.value)
              }
              placeholder="Data Analyst"
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "10px",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            onClick={analyzeCareer}
            disabled={loading}
            style={{
              marginTop: "25px",
              padding: "14px 25px",
              border: "none",
              borderRadius: "10px",
              background: "#5546e8",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(85, 70, 232, 0.2)",
            }}
          >
            {loading
              ? "Analyzing..."
              : "Analyze My Career →"}
          </button>
        </div>

        {result && (
          <section style={{ marginTop: "40px" }}>
            <h2>Career Readiness</h2>

            <div
              style={{
                background: "white",
                padding: "35px",
                borderRadius: "20px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                  fontWeight: "800",
                  color: "#5546e8",
                }}
              >
                {Math.round(readiness)}%
              </div>
<p
  style={{
    marginTop: "5px",
    marginBottom: "20px",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "600",
  }}
>
  {readiness >= 80
    ? "Excellent match — you are close to being job-ready."
    : readiness >= 60
    ? "Good match — strengthen your remaining skill gaps."
    : readiness >= 40
    ? "Promising start — focus on the skills you still need."
    : "You have a clear learning path — start with your priority skills."}
</p>
              <p
  style={{
    color: "#6b7280",
    marginTop: "8px",
    marginBottom: "18px",
  }}
>
  Career Readiness
</p>

<div
  style={{
    width: "100%",
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "25px",
  }}
>
  <div
    style={{
      width: `${Math.min(Math.max(readiness, 0), 100)}%`,
      height: "100%",
      background: "#5546e8",
      borderRadius: "20px",
    }}
  />
</div>

<hr />

              <hr />

              <h3>✓ Matched Skills</h3>

             {matchedSkills.length > 0 ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "15px",
    }}
  >
    {matchedSkills.map((skill, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          padding: "9px 14px",
          background: "#ecfdf3",
          color: "#15803d",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        ✓{" "}
        {typeof skill === "string"
          ? skill
          : skill.skill ||
            skill.required_skill ||
            skill.student_skill ||
            "Skill"}
      </span>
    ))}
  </div>
) : (
  <p>No matched skills found.</p>
)}

              <h3 style={{ marginTop: "30px" }}>
                ⚡ Skills to Develop
              </h3>

            {missingSkills.length > 0 ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "15px",
    }}
  >
    {missingSkills.map((skill, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          padding: "9px 14px",
          background: "#f3f1ff",
          color: "#5546e8",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        +{" "}
        {typeof skill === "string"
          ? skill
          : skill.skill ||
            skill.required_skill ||
            "Skill"}
      </span>
    ))}
  </div>
) : (
  <p>Great! No major skill gaps.</p>
)}

              <Link
                to="/roadmap"
                style={{
                  display: "inline-block",
                  marginTop: "30px",
                  color: "#5546e8",
                  fontWeight: "700",
                }}
              >
                View Learning Roadmap →
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginTop: "8px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  fontSize: "15px",
  outline: "none",
  background: "#fafbff",
};


export default CareerAnalysis;