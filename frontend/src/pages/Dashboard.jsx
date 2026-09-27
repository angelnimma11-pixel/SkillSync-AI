import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [profile, setProfile] = useState({});
  const [progress, setProgress] = useState(null);
  const userEmail =
  localStorage.getItem("skillsync_user_email") || "";

const profileKey =
  `skillsync_student_profile_${userEmail}`;

  useEffect(() => {
  const savedProfile = localStorage.getItem(
  profileKey
);

    const savedProgress = localStorage.getItem(
      "skillsync_progress"
    );

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error(error);
      }
    }

    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
  console.error(error);
  localStorage.removeItem("skillsync_progress");
  setProgress(null);
}
    }
 }, [profileKey]);

  const matched = Array.isArray(progress?.matched_skills)
    ? progress.matched_skills.length
    : 0;

  const missing = Array.isArray(progress?.missing_skills)
    ? progress.missing_skills.length
    : 0;
const recommendations = Array.isArray(progress?.recommendations)
  ? progress.recommendations
  : [];
  const readiness = Number(
    progress?.readiness ??
      progress?.readiness_score ??
      progress?.job_readiness ??
      0
  );

  const targetRole =
    progress?.target_role ||
    progress?.targetRole ||
    "Not analyzed";

  return (
    <main
      style={{
        padding: "70px 8%",
        background: "#f8f9ff",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              color: "#5546e8",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            STUDENT DASHBOARD
          </span>

          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#111827",
            }}
          >
            Your career dashboard
            {profile.studentName
              ? `, ${profile.studentName}`
              : ""}
            .
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
            }}
          >
           Track your readiness, skill gaps, and personalized learning progress in one place.
          </p>
        </div>

        {/* Profile summary */}
        <h2
  style={{
    fontSize: "24px",
    color: "#111827",
    marginBottom: "5px",
  }}
>
  Student Profile
</h2>

        <div style={gridStyle}>
          <Card
            title="STUDENT"
            value={profile.studentName || "Not added"}
          />

          <Card
            title="COLLEGE"
            value={profile.college || "Not added"}
          />

          <Card
            title="BRANCH"
            value={profile.branch || "Not added"}
          />

          <Card
            title="YEAR"
            value={profile.year || "Not added"}
          />
        </div>

        {/* Career summary */}
        <h2
  style={{
    marginTop: "50px",
    fontSize: "24px",
    color: "#111827",
    marginBottom: "5px",
  }}
>
  Career Progress
</h2>

        <div style={gridStyle}>
          <Card
            title="TARGET CAREER"
            value={targetRole}
          />

          <Card
            title="CAREER READINESS"
            value={
              progress
                ? `${Math.round(readiness)}%`
                : "Not analyzed"
            }
            highlight
          />

          <Card
            title="MATCHED SKILLS"
            value={matched}
          />

          <Card
            title="SKILLS TO LEARN"
            value={missing}
          />
        </div>

        {/* Readiness bar */}
        {progress && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "18px",
              marginTop: "25px",
              border: "1px solid #eef0f6",
boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <strong>Career Readiness</strong>

              <strong>
                {Math.round(readiness)}%
              </strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    Math.max(readiness, 0),
                    100
                  )}%`,
                  height: "100%",
                  background: "#5546e8",
                  borderRadius: "20px",
                }}
              />
            </div>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              {readiness >= 80
  ? "Excellent readiness — you are close to being job-ready."
  : readiness >= 60
  ? "Good progress — strengthen your remaining skill gaps."
  : readiness >= 40
  ? "You're building momentum — focus on your priority skills."
  : "Start with the highest-priority skills in your roadmap."}
            </p>
          </div>
        )}
        {/* Skill Progress Visualization */}
        {progress && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "18px",
              marginTop: "25px",
              border: "1px solid #eef0f6",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ marginBottom: "25px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  color: "#111827",
                }}
              >
                Skill Progress
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#6b7280",
                  fontSize: "15px",
                }}
              >
                Your current skill alignment with the selected career.
              </p>
            </div>

            {/* Progress bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <strong>Skills Matched</strong>

              <strong>
                {matched} / {matched + missing}
              </strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  width: `${
                    matched + missing > 0
                      ? (matched / (matched + missing)) * 100
                      : 0
                  }%`,
                  height: "100%",
                  background: "#5546e8",
                  borderRadius: "20px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            {/* Skill statistics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  background: "#f3f1ff",
                  padding: "20px",
                  borderRadius: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  MATCHED SKILLS
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#5546e8",
                  }}
                >
                  {matched}
                </div>
              </div>

              <div
                style={{
                  background: "#fff7ed",
                  padding: "20px",
                  borderRadius: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  SKILLS TO LEARN
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#ea580c",
                  }}
                >
                  {missing}
                </div>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  READINESS
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#16a34a",
                  }}
                >
                  {Math.round(readiness)}%
                </div>
              </div>
            </div>
          </div>
        )}

        
        {/* Actions */}
        {recommendations.length > 0 && (
  <div style={{ marginTop: "45px" }}>
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "24px",
          color: "#111827",
        }}
      >
        Recommended Learning
      </h2>

      <p
        style={{
          margin: "6px 0 0",
          color: "#6b7280",
          fontSize: "15px",
        }}
      >
        Continue learning with courses selected for your skill gaps.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {recommendations.slice(0, 3).map((course, index) => (
        <div
          key={index}
          style={{
  background: "white",
  padding: "30px",
  borderRadius: "18px",
  marginTop: "25px",
  border: "1px solid #eef0f6",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
}}
        >
          <div
            style={{
              color: "#5546e8",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            {course.priority || "RECOMMENDED"}
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#111827",
              fontSize: "19px",
            }}
          >
            {course.course}
          </h3>

          <p
            style={{
              margin: "0 0 15px",
              color: "#6b7280",
            }}
          >
            {course.provider}
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "15px",
            }}
          >
            <span
              style={{
                background: "#f3f1ff",
                color: "#5546e8",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {course.duration} weeks
            </span>

            <span
              style={{
                background: "#f3f4f6",
                color: "#374151",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {course.level}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Covers:{" "}
            {Array.isArray(course.skills)
              ? course.skills.join(", ")
              : course.skills}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
        <div
          style={{
            marginTop: "35px",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/profile" style={buttonStyle}>
            Edit Profile
          </Link>

          <Link
            to="/career-analysis"
            style={buttonStyle}
          >
            Analyze Career
          </Link>

          <Link to="/roadmap" style={buttonStyle}>
            View Roadmap
          </Link>

          <Link to="/industry" style={secondaryButtonStyle}>
            Explore Industry
          </Link>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
borderRadius: "18px",
border: "1px solid #eef0f6",
        boxShadow:
          "0 8px 25px rgba(0,0,0,0.05)",
      }}
    >
      <span
        style={{
          color: "#6b7280",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </span>

      <h3
        style={{
          marginTop: "10px",
          marginBottom: 0,
          color: highlight ? "#5546e8" : "#111827",
          fontSize: "22px",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const buttonStyle = {
  background: "#5546e8",
  color: "white",
  padding: "12px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "700",
  boxShadow: "0 6px 16px rgba(85, 70, 232, 0.2)",
};

const secondaryButtonStyle = {
  background: "white",
  color: "#5546e8",
  padding: "12px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "700",
  border: "1px solid #e5e7eb",
};

export default Dashboard;