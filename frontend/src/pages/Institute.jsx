import { useEffect, useState } from "react";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
function Institute() {
  const [skills, setSkills] = useState([]);
  const [emerging, setEmerging] = useState([]);
  const [jobMarket, setJobMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentProgress, setStudentProgress] = useState(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem(
  "skillsync_progress"
);

if (savedProgress) {
  try {
    setStudentProgress(JSON.parse(savedProgress));
  } catch {
    setStudentProgress(null);
  }
}
    async function loadInstituteData() {
      try {
        setLoading(true);
        setError("");

     const [demandResponse, emergingResponse, jobsResponse] =
  await Promise.all([
    fetch(`${API_BASE}/industry/demand`),
    fetch(`${API_BASE}/industry/emerging`),
    fetch(`${API_BASE}/industry/jobs`),
  ]);

        const demandData = await demandResponse.json();
        const emergingData = await emergingResponse.json();
        const jobsData = await jobsResponse.json();

        if (
          !demandResponse.ok ||
          !emergingResponse.ok ||
          !jobsResponse.ok
        ) {
          throw new Error("Unable to load institute insights.");
        }

        setSkills(
          Array.isArray(demandData.skills)
            ? demandData.skills
            : []
        );

        setEmerging(
          Array.isArray(emergingData.emerging_skills)
            ? emergingData.emerging_skills
            : []
        );

        setJobMarket(jobsData);
      } catch (err) {
        console.error("Institute data error:", err);

        setError(
          err.message ||
            "Unable to connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInstituteData();
  }, []);

  const topSkill = skills[0];

  const topEmergingSkill = emerging[0];

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
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              color: "#5546e8",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            INSTITUTE INTELLIGENCE
          </span>

          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#111827",
            }}
          >
            Institute Skill Intelligence
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
              maxWidth: "750px",
              lineHeight: "1.6",
            }}
          >
            Use industry demand, emerging skill trends, and
            live job-market signals to understand which
            technical skills should receive greater attention.
          </p>
        </div>

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "35px",
              borderRadius: "20px",
              textAlign: "center",
            }}
          >
            <h3>Loading institute insights...</h3>

            <p style={{ color: "#6b7280" }}>
              Fetching industry and job-market intelligence.
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            ⚠ {error}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <InsightCard
                label="Skills Tracked"
                value={skills.length}
              />

              <InsightCard
                label="Emerging Skills"
                value={emerging.length}
              />

              <InsightCard
                label="Live Jobs"
                value={jobMarket?.total_jobs || 0}
              />

              <InsightCard
                label="Top Skill"
                value={topSkill?.skill || "N/A"}
              />
            </div>

            <section style={{ marginTop: "45px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#111827",
                  }}
                >
                  Institute Focus Areas
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  Current industry signals that can help
                  institutions plan skill development activities.
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
                <FocusCard
                  title="High-Demand Skill"
                  value={topSkill?.skill || "N/A"}
                  description={
                    topSkill
                      ? `Current demand score: ${topSkill.demand_score}/100`
                      : "No demand data available."
                  }
                />

                <FocusCard
                  title="Fast-Growing Skill"
                  value={topEmergingSkill?.skill || "N/A"}
                  description={
                    topEmergingSkill
                      ? `Growth rate: +${topEmergingSkill.growth_rate}%`
                      : "No emerging skill data available."
                  }
                />

                <FocusCard
                  title="Job Market Signal"
                  value={
                    jobMarket?.top_locations?.[0]?.location ||
                    "N/A"
                  }
                  description={
                    jobMarket?.top_locations?.[0]
                      ? `${jobMarket.top_locations[0].job_count} jobs found in the top location.`
                      : "No location data available."
                  }
                />
              </div>
            </section>
                        

            {/* Skill Gap Overview */}
            <section style={{ marginTop: "45px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#111827",
                  }}
                >
                  Skill Gap Overview
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  Industry skills that institutions can consider
                  when planning student training and curriculum.
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "18px",
                  border: "1px solid #eef0f6",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                }}
              >
                {skills.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>
                    No skill gap data available.
                  </p>
                ) : (
                  skills.slice(0, 8).map((skill, index) => {
                    const demand = Number(
                      skill?.demand_score ?? 0
                    );

                    const growth = Number(
                      skill?.growth_rate ?? 0
                    );

                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom:
                            index === Math.min(skills.length, 8) - 1
                              ? 0
                              : "22px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              color: "#374151",
                            }}
                          >
                            {skill?.skill || "Skill"}
                          </span>

                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color:
                                growth >= 50
                                  ? "#16a34a"
                                  : "#6b7280",
                            }}
                          >
                            +{growth}% growth
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: "10px",
                              background: "#e5e7eb",
                              borderRadius: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  Math.max(demand, 0),
                                  100
                                )}%`,
                                height: "100%",
                                background: "#5546e8",
                                borderRadius: "20px",
                              }}
                            />
                          </div>

                          <span
                            style={{
                              width: "55px",
                              textAlign: "right",
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#5546e8",
                            }}
                          >
                            {demand}/100
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
                        {/* Student Skill Gap Insights */}
            <section style={{ marginTop: "45px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#111827",
                  }}
                >
                  Student Skill Gap Insights
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  Insights from the currently available student
                  career-analysis data.
                </p>
              </div>

              {!studentProgress ? (
                <div
                  style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "18px",
                    border: "1px solid #eef0f6",
                    color: "#6b7280",
                  }}
                >
                  No student career-analysis data is available yet.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <InsightCard
                    label="Student Readiness"
                    value={`${Math.round(
                      Number(studentProgress.readiness || 0)
                    )}%`}
                  />

                  <InsightCard
                    label="Matched Skills"
                    value={
                      Array.isArray(
                        studentProgress.matched_skills
                      )
                        ? studentProgress.matched_skills.length
                        : 0
                    }
                  />

                  <InsightCard
                    label="Skills to Learn"
                    value={
                      Array.isArray(
                        studentProgress.missing_skills
                      )
                        ? studentProgress.missing_skills.length
                        : 0
                    }
                  />

                  <InsightCard
                    label="Target Role"
                    value={
                      studentProgress.target_role || "N/A"
                    }
                  />
                </div>
              )}
            </section>
                        {/* Institute Skill Priority */}
            <section style={{ marginTop: "45px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#111827",
                  }}
                >
                  Institute Skill Priority
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "15px",
                  }}
                >
                  Skills combining strong industry demand with
                  meaningful growth signals.
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "18px",
                  border: "1px solid #eef0f6",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
                }}
              >
                {skills.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>
                    No skill priority data available.
                  </p>
                ) : (
                  skills
                    .slice(0, 8)
                    .map((skill, index) => {
                      const demand = Number(
                        skill?.demand_score ?? 0
                      );

                      const growth = Number(
                        skill?.growth_rate ?? 0
                      );

                      const priorityScore =
                        demand * 0.7 +
                        Math.min(Math.max(growth, 0), 100) * 0.3;

                      let priority = "Medium";

                      if (priorityScore >= 75) {
                        priority = "High";
                      } else if (priorityScore < 45) {
                        priority = "Low";
                      }

                      return (
                        <div
                          key={index}
                          style={{
                            padding: "18px 0",
                            borderBottom:
                              index < Math.min(skills.length, 8) - 1
                                ? "1px solid #f0f1f5"
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "15px",
                              marginBottom: "8px",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  color: "#111827",
                                }}
                              >
                                {index + 1}.{" "}
                                {skill?.skill || "Skill"}
                              </strong>

                              <div
                                style={{
                                  marginTop: "4px",
                                  color: "#6b7280",
                                  fontSize: "13px",
                                }}
                              >
                                Demand: {demand}/100 · Growth: +{growth}%
                              </div>
                            </div>

                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: "20px",
                                background:
                                  priority === "High"
                                    ? "#dcfce7"
                                    : priority === "Medium"
                                    ? "#fef3c7"
                                    : "#f3f4f6",
                                color:
                                  priority === "High"
                                    ? "#15803d"
                                    : priority === "Medium"
                                    ? "#a16207"
                                    : "#6b7280",
                                fontSize: "12px",
                                fontWeight: "800",
                              }}
                            >
                              {priority} Priority
                            </span>
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: "9px",
                              background: "#e5e7eb",
                              borderRadius: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  Math.max(priorityScore, 0),
                                  100
                                )}%`,
                                height: "100%",
                                background: "#5546e8",
                                borderRadius: "20px",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              marginTop: "6px",
                              textAlign: "right",
                              color: "#5546e8",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            Priority Score:{" "}
                            {Math.round(priorityScore)}/100
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          </>
        )}
         
      </div>
    </main>
  );
}

function InsightCard({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "18px",
        border: "1px solid #eef0f6",
        boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          color: "#6b7280",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "10px",
          color: "#5546e8",
          fontSize: "28px",
          fontWeight: "800",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FocusCard({ title, value, description }) {
  return (
    <div
      style={{
        background: "white",
        padding: "28px",
        borderRadius: "18px",
        border: "1px solid #eef0f6",
        boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          color: "#5546e8",
          fontSize: "13px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          color: "#111827",
          fontSize: "22px",
        }}
      >
        {value}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default Institute;