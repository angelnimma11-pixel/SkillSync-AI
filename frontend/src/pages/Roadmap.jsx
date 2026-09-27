import { useEffect, useState } from "react";

function Roadmap() {
  const [result, setResult] = useState(null);
  const [jobLearning, setJobLearning] = useState(null);
  const jobRecommendations = Array.isArray(
  jobLearning?.recommendations
)
  ? jobLearning.recommendations
  : [];

 useEffect(() => {
  const saved = localStorage.getItem("skillsync_progress");

  if (saved) {
    try {
      setResult(JSON.parse(saved));
    } catch (error) {
      console.error(error);
      localStorage.removeItem("skillsync_progress");
      setResult(null);
    }
  }

  const savedJobLearning = localStorage.getItem(
    "skillsync_job_learning"
  );

  if (savedJobLearning) {
    try {
      setJobLearning(JSON.parse(savedJobLearning));
    } catch (error) {
      console.error(error);
      localStorage.removeItem("skillsync_job_learning");
      setJobLearning(null);
    }
  }
}, []);
  const missingSkills = Array.isArray(result?.missing_skills)
  ? result.missing_skills
  : [];

const learningSequence = Array.isArray(result?.learning_sequence)
  ? result.learning_sequence
  : missingSkills;

const recommendations = Array.isArray(result?.recommendations)
  ? result.recommendations
  : [];
  const targetRole =
    result?.target_role ||
    result?.targetRole ||
    "your target career";

  return (
    <main
      style={{
        padding: "70px 8%",
        minHeight: "80vh",
        background: "#f8f9ff",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <div style={{ marginBottom: "35px" }}>
          <span
            style={{
              color: "#5546e8",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            PERSONALIZED ROADMAP
          </span>

          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#111827",
            }}
          >
            Your path to job readiness.
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
            }}
          >
            Focus on the skills you need to develop next.
          </p>
        </div>

        {!result ? (
          <div
            style={{
              background: "white",
              padding: "35px",
              borderRadius: "20px",
             border: "1px solid #eef0f6",
boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <h3>No roadmap available yet.</h3>

            <p style={{ color: "#6b7280" }}>
              Complete a career analysis first to generate
              your personalized learning roadmap.
            </p>
          </div>
        ) : (
          <div>
            <div
          
  style={{
    background: "white",
    padding: "25px 30px",
    borderRadius: "18px",
    marginBottom: "25px",
    border: "1px solid #eef0f6",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  }}
>
              <small
                style={{
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                TARGET CAREER
              </small>

              <h2
                style={{
                  margin: "8px 0 0",
                  color: "#111827",
                }}
              >
                {targetRole}
              </h2>
            </div>

            {learningSequence.length === 0 ? (
              <div
                style={{
                  background: "white",
                  padding: "35px",
                  borderRadius: "20px",
                 border: "1px solid #eef0f6",
boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "10px",
                  }}
                >
                  🎉
                </div>

                <h2>You're looking strong!</h2>

                <p style={{ color: "#6b7280" }}>
                  You currently have no major skill gaps for
                  your selected career.
                </p>
              </div>
            ) : (
              <>
              {jobLearning && (
  <div
    style={{
      background: "white",
      padding: "25px 30px",
      borderRadius: "18px",
      marginBottom: "25px",
      border: "1px solid #eef0f6",
      boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
    }}
  >
    <small
      style={{
        color: "#5546e8",
        fontWeight: "700",
        letterSpacing: "0.5px",
      }}
    >
      JOB-SPECIFIC LEARNING PLAN
    </small>

    <h2
      style={{
        margin: "8px 0",
        color: "#111827",
      }}
    >
      {jobLearning.title || "Selected Job"}
    </h2>

    <p
      style={{
        margin: "0 0 18px",
        color: "#6b7280",
      }}
    >
      {jobLearning.company || "Company"} — Focus on these skills
      to improve your fit for this role.
    </p>

    {Array.isArray(jobLearning.missing_skills) &&
      jobLearning.missing_skills.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
         {jobLearning.missing_skills.map((skill, index) => {
  const skillName =
    typeof skill === "string"
      ? skill
      : skill.skill ||
        skill.required_skill ||
        "Skill";

  return (
    <div
      key={index}
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        marginBottom: "12px",
        padding: "14px",
        borderRadius: "12px",
        background: "#f8f9ff",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          minWidth: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#5546e8",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: "13px",
        }}
      >
        {index + 1}
      </div>

      <div>
        <strong
          style={{
            color: "#111827",
            fontSize: "15px",
          }}
        >
          {skillName}
        </strong>

        <p
          style={{
            margin: "4px 0 0",
            color: "#6b7280",
            fontSize: "13px",
          }}
        >
          Develop {skillName} to improve your fit for this job.
        </p>
      </div>
    </div>
  );
})}
        </div>
      )}
  </div>
)}

{jobRecommendations.length > 0 && (
  <div
    style={{
      background: "white",
      padding: "25px 30px",
      borderRadius: "18px",
      marginBottom: "25px",
      border: "1px solid #eef0f6",
      boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
    }}
  >
    <small
      style={{
        color: "#5546e8",
        fontWeight: "700",
        letterSpacing: "0.5px",
      }}
    >
      RECOMMENDED COURSES
    </small>

    <h2
      style={{
        margin: "8px 0 6px",
        color: "#111827",
      }}
    >
      Courses to Build Your Missing Skills
    </h2>

    <p
      style={{
        margin: "0 0 20px",
        color: "#6b7280",
        fontSize: "14px",
      }}
    >
      These courses are matched to the skills required by this job.
    </p>
    {jobRecommendations.map((course, index) => (
  <div
    key={index}
    style={{
      padding: "16px",
      marginBottom: "12px",
      borderRadius: "12px",
      background: "#f8f9ff",
      border: "1px solid #e5e7eb",
    }}
  >
    <h3
      style={{
        margin: "0 0 6px",
        color: "#111827",
        fontSize: "16px",
      }}
    >
      {course.course}
    </h3>

    <p
      style={{
        margin: "0 0 8px",
        color: "#6b7280",
        fontSize: "13px",
      }}
    >
      {course.provider} • {course.duration} weeks • {course.level}
    </p>

    {Array.isArray(course.skills) && course.skills.length > 0 && (
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {course.skills.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            style={{
              background: "#eeeafe",
              color: "#5546e8",
              padding: "5px 9px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    )}
  </div>
))}
  </div>
)}

<div style={{ marginBottom: "20px" }}>
  <h2
    style={{
      margin: 0,
      color: "#111827",
      fontSize: "26px",
    }}
  >
    Your Skill Development Plan
  </h2>

  <p
    style={{
      margin: "6px 0 0",
      color: "#6b7280",
      fontSize: "15px",
    }}
  >
    Build these skills in priority order to improve your readiness for {targetRole}.
  </p>
</div>
{learningSequence.map((skill, index) => {
                  const name =
                    typeof skill === "string"
                      ? skill
                      : skill.skill ||
                        skill.required_skill ||
                        "Skill";

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "flex-start",
                        background: "white",
                       padding: "28px",
borderRadius: "18px",
marginBottom: "15px",
border: "1px solid #eef0f6",
boxShadow:
  "0 8px 25px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#5546e8",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <small
  style={{
    color: "#5546e8",
    fontWeight: "700",
    letterSpacing: "0.5px",
  }}
>
  {index === 0
    ? "START HERE"
    : "LEARN NEXT"}
  {skill.priority && ` • ${skill.priority} PRIORITY`}
</small>

                        <h3
                          style={{
                            margin:
                              "6px 0 8px",
                          }}
                        >
                          {name}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                          }}
                        >
                         Develop {name} to improve your
readiness for {targetRole}.
                        </p>
                      </div>
                    </div>
                  );
                })}
                                {recommendations.length > 0 && (
                  <div style={{ marginTop: "45px" }}>
                    <div style={{ marginBottom: "20px" }}>
                      <h2
                        style={{
                          margin: 0,
                          color: "#111827",
                          fontSize: "26px",
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
                        Courses selected to help you close your skill gaps.
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
                      {recommendations.map((course, index) => (
                        <div
                          key={index}
                          style={{
                            background: "white",
                            padding: "25px",
                            borderRadius: "18px",
                            border: "1px solid #eef0f6",
                            boxShadow:
                              "0 8px 25px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              color: "#5546e8",
                              fontSize: "13px",
                              fontWeight: "700",
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
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Roadmap;