import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { useEffect, useState } from "react";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

import "./App.css";

import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import CareerAnalysis from "./pages/CareerAnalysis.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Industry from "./pages/Industry.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("Data Analyst");

  const [studentName, setStudentName] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState(
    "Computer Science and Engineering"
  );
  const [year, setYear] = useState("3rd Year");

  const [profileSaved, setProfileSaved] = useState(false);
  const [result, setResult] = useState(null);

  // STEP 19 - PROGRESS TRACKING
  const [progressData, setProgressData] = useState(null);

  const [careerMatches, setCareerMatches] = useState([]);

  const [industrySkills, setIndustrySkills] = useState([]);
  const [emergingSkills, setEmergingSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] =
    useState(false);
  const [industryLoading, setIndustryLoading] =
    useState(true);

  const [error, setError] = useState("");
const userEmail =
  localStorage.getItem("skillsync_user_email") || "";

const profileKey =
  `skillsync_student_profile_${userEmail}`;
  /* =========================================================
     SAFE HELPERS
     ========================================================= */

  const safeText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => safeText(item))
        .join(", ");
    }

    if (typeof value === "object") {
      if (value.message) {
        return safeText(value.message);
      }

      if (value.error) {
        return safeText(value.error);
      }

      if (value.detail) {
        return safeText(value.detail);
      }

      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }

    return fallback;
  };

  /* =========================================================
     PROFILE
     ========================================================= */

  const saveProfile = () => {
    const profile = {
      studentName,
      college,
      branch,
      year,
    };

  localStorage.setItem(
  profileKey,
  JSON.stringify(profile)
);
    setProfileSaved(true);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem(
  profileKey
);

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);

        setStudentName(profile.studentName || "");
        setCollege(profile.college || "");

        setBranch(
          profile.branch ||
            "Computer Science and Engineering"
        );

        setYear(profile.year || "3rd Year");

        setProfileSaved(true);
      } catch (error) {
        console.error(
          "Unable to load student profile:",
          error
        );
      }
    }
  }, [profileKey]);

  /* =========================================================
     LOAD SAVED CAREER PROGRESS
     ========================================================= */

  useEffect(() => {
    const savedProgress = localStorage.getItem(
      "skillsync_progress"
    );

    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);

        setProgressData(progress);
        setResult(progress);
      } catch (error) {
        console.error(
          "Unable to load career progress:",
          error
        );
      }
    }
  }, []);

  /* =========================================================
     ERROR HELPERS
     ========================================================= */

  const getErrorMessage = (data, fallback) => {
    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return safeText(data.detail, fallback);
    }

    if (data.message) {
      return safeText(data.message, fallback);
    }

    if (data.error) {
      return safeText(data.error, fallback);
    }

    return fallback;
  };

  const getArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  /* =========================================================
     LOAD INDUSTRY DATA
     ========================================================= */

  useEffect(() => {
    const loadIndustryData = async () => {
      try {
        const demandResponse = await fetch(
  `${API_BASE}/industry/demand`
);
        const demandData =
          await demandResponse.json();

        if (demandResponse.ok) {
          setIndustrySkills(
            getArray(demandData.skills)
          );
        }

       const emergingResponse = await fetch(
  `${API_BASE}/industry/emerging`
);
        const emergingData =
          await emergingResponse.json();

        if (emergingResponse.ok) {
          setEmergingSkills(
            getArray(
              emergingData.emerging_skills
            )
          );
        }
      } catch (err) {
        console.error(
          "Industry data error:",
          err
        );
      } finally {
        setIndustryLoading(false);
      }
    };

    loadIndustryData();
  }, []);

  /* =========================================================
     ANALYZE CAREER FOR ROLE
     ========================================================= */

  const analyzeCareerForRole = async (
    selectedRole
  ) => {
    setError("");
    setResult(null);

    const studentSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(
        (skill) => skill.length > 0
      );

    if (studentSkills.length === 0) {
      setError(
        "Please enter at least one skill before viewing a career roadmap."
      );

      document
        .getElementById("analysis")
        ?.scrollIntoView({
          behavior: "smooth",
        });

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
            target_role: selectedRole,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      console.log(
        "Career Roadmap Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Career analysis failed. Server returned ${response.status}.`
          )
        );
      }

      if (data.success === false) {
        throw new Error(
          getErrorMessage(
            data,
            "The career analysis could not be completed."
          )
        );
      }

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "The backend returned an unexpected response."
        );
      }

      setResult(data);

      localStorage.setItem(
        "skillsync_progress",
        JSON.stringify(data)
      );

      setProgressData(data);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 150);
    } catch (err) {
      console.error(
        "Career Roadmap Error:",
        err
      );

      setError(
        safeText(
          err?.message,
          "Unable to generate the career roadmap."
        )
      );

      document
        .getElementById("analysis")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ANALYZE CAREER
     ========================================================= */

  const analyzeCareer = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setError("");
    setResult(null);

    const studentSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(
        (skill) => skill.length > 0
      );

    if (studentSkills.length === 0) {
      setError(
        "Please enter at least one skill."
      );
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

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      console.log(
        "Career Analysis Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Career analysis failed. Server returned ${response.status}.`
          )
        );
      }

      if (data.success === false) {
        throw new Error(
          getErrorMessage(
            data,
            "The career analysis could not be completed."
          )
        );
      }

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "The backend returned an unexpected response."
        );
      }

      setResult(data);

      localStorage.setItem(
        "skillsync_progress",
        JSON.stringify(data)
      );

      setProgressData(data);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (err) {
      console.error(
        "Career Analysis Error:",
        err
      );

      setError(
        safeText(
          err?.message,
          "Unable to connect to SkillSync AI. Please make sure the FastAPI backend is running."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CAREER RECOMMENDATION
     ========================================================= */

  const findBestCareers = async () => {
    setError("");
    setCareerMatches([]);

    const studentSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(
        (skill) => skill.length > 0
      );

    if (studentSkills.length === 0) {
      setError(
        "Please enter at least one skill before finding career matches."
      );
      return;
    }

    setRecommendLoading(true);

    try {
      const querySkills =
        encodeURIComponent(
          studentSkills.join(",")
        );

   const response = await fetch(
  `${API_BASE}/career/recommend?skills=${querySkills}`
);

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The career recommendation service returned an invalid response."
        );
      }

      console.log(
        "Career Recommendation Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Career recommendation failed. Server returned ${response.status}.`
          )
        );
      }

      if (data.success === false) {
        throw new Error(
          getErrorMessage(
            data,
            "Career recommendations could not be generated."
          )
        );
      }

      const recommendations =
        getArray(
          data.recommendations ||
            data.career_matches ||
            data.matches
        );

      setCareerMatches(
        recommendations
      );

      setTimeout(() => {
        document
          .getElementById("career-matches")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (err) {
      console.error(
        "Career Recommendation Error:",
        err
      );

      setError(
        safeText(
          err?.message,
          "Unable to generate career recommendations."
        )
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const scrollToAnalysis = () => {
    document
      .getElementById("analysis")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* =========================================================
     INDUSTRY HELPERS
     ========================================================= */

  const getIndustrySkillData = (
    skillName
  ) => {
    const normalized =
      safeText(skillName)
        .toLowerCase()
        .trim();

    return industrySkills.find(
      (item) =>
        safeText(item.skill)
          .toLowerCase()
          .trim() === normalized
    );
  };

  const getPriority = (demandScore) => {
    const score =
      Number(demandScore) || 0;

    if (score >= 85) {
      return "HIGH";
    }

    if (score >= 75) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const getRoadmapStage = (index) => {
    if (index === 0) {
      return "START HERE";
    }

    if (index === 1) {
      return "LEARN NEXT";
    }

    return "BUILD LATER";
  };

  const getRoadmapDescription = (
    skill,
    index
  ) => {
    if (index === 0) {
      return `Start by building a strong foundation in ${skill}. This is currently one of the most important gaps to address.`;
    }

    if (index === 1) {
      return `Once your first priority is covered, develop ${skill} to strengthen your career readiness.`;
    }

    return `Add ${skill} after the higher-priority gaps are addressed to further improve your industry alignment.`;
  };

  /* =========================================================
     RESULT DATA
     ========================================================= */

  const matchedSkills = getArray(
    result?.matched_skills
  );

  const missingSkills = getArray(
    result?.missing_skills
  );

  const recommendations = getArray(
    result?.recommendations
  );

  /* =========================================================
     SMART SKILL PRIORITIES
     ========================================================= */

  const smartPriorities = getArray(
    result?.skill_priorities
  );

  /* =========================================================
     SKILL GAP VISUALIZATION DATA
     ========================================================= */

  const readinessScore =
    Number(
      result?.job_readiness ??
        result?.readiness_score ??
        result?.readiness ??
        0
    );

  const totalRequiredSkills =
    matchedSkills.length +
    missingSkills.length;

  const matchedPercentage =
    totalRequiredSkills > 0
      ? Math.round(
          (matchedSkills.length /
            totalRequiredSkills) *
            100
        )
      : 0;

  const prioritizedGaps = missingSkills
    .map((item) => {
      const skillName =
        typeof item === "string"
          ? item
          : item?.skill ||
            item?.required_skill ||
            "";

      const industryData =
        getIndustrySkillData(
          skillName
        );

      return {
        skill: safeText(skillName),
        industryData,
      };
    })
    .sort(
      (a, b) =>
        (Number(
          b.industryData?.demand_score
        ) || 0) -
        (Number(
          a.industryData?.demand_score
        ) || 0)
    );

  const roadmapPrioritySkills =
    smartPriorities.length > 0
      ? smartPriorities
      : prioritizedGaps;

  const topIndustrySkills = [
    ...industrySkills,
  ]
    .sort(
      (a, b) =>
        (Number(b.demand_score) || 0) -
        (Number(a.demand_score) || 0)
    )
    .slice(0, 6);

  /* =========================================================
     PERSONALIZED INDUSTRY ALIGNMENT
     ========================================================= */

  const studentSkillList = skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(
      (skill) => skill.length > 0
    );

  const alignedIndustrySkills =
    studentSkillList
      .map((studentSkill) => {
        const industryData =
          getIndustrySkillData(
            studentSkill
          );

        return {
          studentSkill,
          industryData,
        };
      })
      .filter(
        (item) => item.industryData
      );

  const highDemandStudentSkills =
    alignedIndustrySkills.filter(
      (item) =>
        Number(
          item.industryData?.demand_score
        ) >= 85
    );

  const emergingStudentSkills =
    alignedIndustrySkills.filter(
      (item) =>
        safeText(
          item.industryData?.status
        ).toLowerCase() ===
        "emerging"
    );

  const strongestIndustrySkill =
    [...alignedIndustrySkills].sort(
      (a, b) =>
        (Number(
          b.industryData?.demand_score
        ) || 0) -
        (Number(
          a.industryData?.demand_score
        ) || 0)
    )[0];

  /* =========================================================
     HOMEPAGE
     
     IMPORTANT:
     The entire old homepage is now inside this component.
     This prevents JSX from appearing after the return.
     ========================================================= */

  const HomePage = () => {
  const navigate = useNavigate();

  return (
      <div>
        {/* =====================================================
            STUDENT PROFILE
            ===================================================== */}

        <section
          className="profile-section"
          id="profile"
          style={{
            padding: "80px 6%",
            background: "#f8f9ff",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div className="section-heading">
              <div className="small-label">
                STUDENT PROFILE
              </div>

              <h2>
                Build your career profile.
              </h2>

              <p>
                Tell SkillSync AI a little
                about yourself to personalize
                your career journey.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "32px",
                boxShadow:
                  "0 15px 40px rgba(0,0,0,0.06)",
                border:
                  "1px solid rgba(85,70,232,0.08)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "24px",
                }}
              >
                <div className="form-group">
                  <label>
                    Student Name
                  </label>

                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) =>
                      setStudentName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    College / University
                  </label>

                  <input
                    type="text"
                    value={college}
                    onChange={(e) =>
                      setCollege(
                        e.target.value
                      )
                    }
                    placeholder="Enter your college name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Branch
                  </label>

                  <select
                    value={branch}
                    onChange={(e) =>
                      setBranch(
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Computer Science and
                      Engineering
                    </option>

                    <option>
                      Information Technology
                    </option>

                    <option>
                      Artificial Intelligence
                    </option>

                    <option>
                      Data Science
                    </option>

                    <option>
                      Electronics and
                      Communication
                    </option>

                    <option>
                      Electrical Engineering
                    </option>

                    <option>
                      Mechanical Engineering
                    </option>

                    <option>
                      Civil Engineering
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Current Year
                  </label>

                  <select
                    value={year}
                    onChange={(e) =>
                      setYear(
                        e.target.value
                      )
                    }
                  >
                    <option>
                      1st Year
                    </option>
                    <option>
                      2nd Year
                    </option>
                    <option>
                      3rd Year
                    </option>
                    <option>
                      4th Year
                    </option>
                    <option>
                      Graduate
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  marginTop: "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <button
                  type="button"
                  className="primary-btn"
                  onClick={saveProfile}
                >
                  Save Profile
                </button>

                {profileSaved && (
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Profile saved successfully
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STUDENT DASHBOARD
            ===================================================== */}

        <section
          className="dashboard-section"
          id="dashboard"
          style={{
            padding: "80px 6%",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div className="section-heading">
              <div className="small-label">
                STUDENT DASHBOARD
              </div>

              <h2>
                Welcome back
                {studentName
                  ? `, ${studentName}`
                  : ""}
                .
              </h2>

              <p>
                Your personalized career
                journey starts here.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: "20px",
              }}
            >
              <div className="dashboard-card">
                <span>STUDENT</span>
                <h3>
                  {studentName ||
                    "Not added"}
                </h3>
              </div>

              <div className="dashboard-card">
                <span>COLLEGE</span>
                <h3>
                  {college ||
                    "Not added"}
                </h3>
              </div>

              <div className="dashboard-card">
                <span>BRANCH</span>
                <h3>{branch}</h3>
              </div>

              <div className="dashboard-card">
                <span>YEAR</span>
                <h3>{year}</h3>
              </div>
            </div>

            {/* CAREER PROGRESS */}

            <div
              style={{
                marginTop: "32px",
              }}
            >
              <div className="section-heading">
                <div className="small-label">
                  CAREER PROGRESS
                </div>

                <h2>
                  Your Skill Progress
                </h2>

                <p>
                  Track your readiness and
                  understand what to learn
                  next.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "20px",
                }}
              >
                <div className="dashboard-card">
                  <span>
                    CAREER READINESS
                  </span>

                  <h3>
                    {progressData?.readiness !==
                    undefined
                      ? `${Number(
                          progressData.readiness
                        ).toFixed(0)}%`
                      : "Not analyzed"}
                  </h3>
                </div>

                <div className="dashboard-card">
                  <span>
                    MATCHED SKILLS
                  </span>

                  <h3>
                    {Array.isArray(
                      progressData?.matched_skills
                    )
                      ? progressData
                          .matched_skills
                          .length
                      : 0}
                  </h3>
                </div>

                <div className="dashboard-card">
                  <span>
                    SKILLS TO LEARN
                  </span>

                  <h3>
                    {Array.isArray(
                      progressData?.missing_skills
                    )
                      ? progressData
                          .missing_skills
                          .length
                      : 0}
                  </h3>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                borderRadius: "20px",
                background: "#f8f9ff",
                border:
                  "1px solid rgba(85,70,232,0.08)",
              }}
            >
              <strong>
                🚀 Career Journey
              </strong>

              <p
                style={{
                  marginTop: "8px",
                  opacity: 0.75,
                }}
              >
                Analyze your skills to
                discover your career
                readiness, skill gaps,
                industry priorities,
                recommended courses, and
                personalized roadmap.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            HERO
            ===================================================== */}

        <main>
          <section
            className="hero"
            id="home"
          >
            <div className="hero-content">
              <div className="hero-badge">
                ✦ AI-POWERED CAREER
                INTELLIGENCE
              </div>

              <h1>
                Align your skills with
                <span>
                  the future of work.
                </span>
              </h1>

              <p className="hero-description">
                Discover the skills employers
                need, identify your career
                gaps, and build a personalized
                path to become job-ready.
              </p>

        <div className="hero-actions">
  <button
    className="primary-button"
    onClick={() => navigate("/career-analysis")}
  >
    Analyze My Skills
    <span>→</span>
  </button>

  <button
    className="secondary-button"
    onClick={scrollToHowItWorks}
  >
    How it works
  </button>

  <button
    className="secondary-button"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
</div>

              <div className="hero-stats">
                <div>
                  <strong>AI</strong>
                  <span>
                    Skill Matching
                  </span>
                </div>

                <div>
                  <strong>100%</strong>
                  <span>
                    Personalized
                  </span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>
                    Career Insights
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              INDUSTRY DEMAND
              =================================================== */}

          <section
            className="industry-section"
            id="industry"
          >
            <div className="section-heading">
              <div className="small-label">
                INDUSTRY INTELLIGENCE
              </div>

              <h2>
                Skills shaping the future.
              </h2>

              <p>
                Understand which technical
                skills are currently important
                and which are growing rapidly.
              </p>
            </div>

            {industryLoading ? (
              <div className="loading-box">
                Loading industry
                intelligence...
              </div>
            ) : (
              <div className="industry-grid">
                {topIndustrySkills.map(
                  (item, index) => (
                    <div
                      className="industry-card"
                      key={
                        item.skill ||
                        index
                      }
                    >
                      <div className="industry-number">
                        0{index + 1}
                      </div>

                      <h3>
                        {safeText(
                          item.skill,
                          "Skill"
                        )}
                      </h3>

                      <p>
                        {safeText(
                          item.category,
                          "Technology"
                        )}
                      </p>

                      <div className="industry-score">
                        <strong>
                          {safeText(
                            item.demand_score,
                            "0"
                          )}
                        </strong>

                        <span>
                          Demand Score
                        </span>
                      </div>

                      <div className="growth">
                        +
                        {safeText(
                          item.growth_rate,
                          "0"
                        )}
                        %
                        <span>
                          growth
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ===================================================
              ANALYSIS
              =================================================== */}

          <section
            className="analysis-section"
            id="analysis"
          >
            <div className="section-heading">
              <div className="small-label">
                CAREER INTELLIGENCE
              </div>

              <h2>
                Know where you stand.
              </h2>

              <p>
                Tell us your current skills
                and your target career.
                SkillSync AI will analyze
                your skill alignment.
              </p>
            </div>

            <form
              className="analysis-card"
              onSubmit={analyzeCareer}
            >
              <div className="card-header">
                <div className="card-icon">
                  ✦
                </div>

                <div>
                  <h3>
                    Career Readiness
                    Analysis
                  </h3>

                  <p>
                    Analyze your skills
                    against industry
                    requirements.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Your Skills
                </label>

                <input
                  type="text"
                  value={skills}
                  onChange={(e) =>
                    setSkills(
                      e.target.value
                    )
                  }
                  placeholder="Python, SQL, Machine Learning, Git..."
                />

                <span className="input-hint">
                  Separate multiple skills
                  using commas.
                </span>
              </div>

              <div className="form-group">
                <label>
                  Target Career
                </label>

                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(
                      e.target.value
                    )
                  }
                  placeholder="Enter your target career..."
                />

                <span className="input-hint">
                  Enter any career you are
                  interested in, or leave it
                  blank if you're unsure.
                </span>
              </div>

              {error && (
                <div className="error-message">
                  ⚠ {safeText(error)}
                </div>
              )}

              <div className="analysis-actions">
                <button
                  type="submit"
                  className="analyze-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing your
                      skills...
                    </>
                  ) : (
                    <>
                      Analyze My Career
                      <span>→</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="find-careers-button"
                  onClick={
                    findBestCareers
                  }
                  disabled={
                    recommendLoading
                  }
                >
                  {recommendLoading ? (
                    <>
                      <span className="spinner dark"></span>
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      Find My Best Careers
                      <span>✦</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ===================================================
              CAREER ANALYSIS RESULTS
              =================================================== */}

          {result && (
            <section
              className="results-section"
              id="results"
            >
              <div className="section-heading">
                <div className="small-label">
                  YOUR AI ANALYSIS
                </div>

                <h2>
                  Your career readiness.
                </h2>

                <p>
                  Here's how your current
                  skills align with the
                  selected career.
                </p>
              </div>

              {/* JOB CARD */}

              <div className="job-card">
                <div>
                  <span className="job-label">
                    TARGET ROLE
                  </span>

                  <h3>
                    {safeText(
                      result?.job?.title,
                      targetRole
                    )}
                  </h3>

                  <p>
                    {safeText(
                      result?.job?.company,
                      "SkillSync AI"
                    )}

                    <span className="dot">
                      •
                    </span>

                    {safeText(
                      result?.job?.location,
                      "Career Intelligence"
                    )}
                  </p>
                </div>

                <div className="job-status">
                  AI ANALYZED
                </div>
              </div>

              {/* READINESS */}

              <div className="readiness-card">
                <div className="readiness-circle">
                  <div>
                    <strong>
                      {Math.round(
                        Number(
                          result?.readiness
                        ) || 0
                      )}
                    </strong>

                    <span>%</span>
                  </div>
                </div>

                <div className="readiness-content">
                  <span className="readiness-label">
                    CAREER READINESS
                  </span>

                  <h3>
                    {Number(
                      result?.readiness
                    ) >= 75
                      ? "You're highly job-ready!"
                      : Number(
                            result?.readiness
                          ) >= 50
                      ? "You're on the right track!"
                      : "Let's close your skill gaps."}
                  </h3>

                  <p>
                    Your score represents
                    how closely your current
                    skills match the
                    requirements of the
                    selected role.
                  </p>
                </div>
              </div>

              {/* SKILLS */}

              <div className="skill-grid">
                {/* MATCHED */}

                <div className="skill-card">
                  <div className="skill-card-title">
                    <span className="green-dot"></span>

                    Matched Skills

                    <span className="count">
                      {
                        matchedSkills.length
                      }
                    </span>
                  </div>

                  <div className="skill-list">
                    {matchedSkills.length >
                    0 ? (
                      matchedSkills.map(
                        (
                          skill,
                          index
                        ) => {
                          const requiredSkill =
                            typeof skill ===
                            "string"
                              ? skill
                              : skill?.required_skill ||
                                skill?.skill ||
                                "";

                          const studentSkill =
                            typeof skill ===
                            "string"
                              ? skill
                              : skill?.student_skill ||
                                skill?.matched_skill ||
                                requiredSkill;

                          return (
                            <div
                              className="skill-item matched"
                              key={index}
                            >
                              <span>
                                ✓
                              </span>

                              <div>
                                <strong>
                                  {safeText(
                                    requiredSkill,
                                    "Skill"
                                  )}
                                </strong>

                                <small>
                                  Matched with{" "}
                                  {safeText(
                                    studentSkill,
                                    "your skill"
                                  )}
                                </small>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <p className="empty-text">
                        No matching skills
                        found yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* GAPS */}

                <div className="skill-card">
                  <div className="skill-card-title">
                    <span className="orange-dot"></span>

                    Skill Gaps

                    <span className="count">
                      {
                        missingSkills.length
                      }
                    </span>
                  </div>

                  <div className="skill-list">
                    {missingSkills.length >
                    0 ? (
                      missingSkills.map(
                        (
                          skill,
                          index
                        ) => {
                          const skillName =
                            typeof skill ===
                            "string"
                              ? skill
                              : skill?.skill ||
                                skill?.required_skill ||
                                "";

                          return (
                            <div
                              className="skill-item missing"
                              key={index}
                            >
                              <span>
                                !
                              </span>

                              <div>
                                <strong>
                                  {safeText(
                                    skillName,
                                    "Skill"
                                  )}
                                </strong>

                                <small>
                                  Recommended
                                  to learn
                                </small>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <p className="empty-text">
                        Great! No major
                        skill gaps
                        detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SMART PRIORITIES */}

              {smartPriorities.length >
                0 && (
                <div
                  className="industry-priority"
                  style={{
                    marginTop: "32px",
                    padding: "32px",
                    borderRadius: "24px",
                  }}
                >
                  <div className="roadmap-header">
                    <div className="small-label">
                      SMART SKILL
                      PRIORITIZATION
                    </div>

                    <h2>
                      Learn these skills
                      first.
                    </h2>

                    <p>
                      SkillSync AI ranks
                      your missing skills
                      using industry
                      demand, growth
                      rate, job
                      opportunities,
                      and your current
                      skill gap.
                    </p>
                  </div>

                  <div className="priority-grid">
                    {smartPriorities.map(
                      (
                        item,
                        index
                      ) => {
                        const score =
                          Number(
                            item?.priority_score
                          ) || 0;

                        const demand =
                          Number(
                            item?.demand_score
                          ) || 0;

                        const growth =
                          Number(
                            item?.growth_rate
                          ) || 0;

                        const jobs =
                          Number(
                            item?.job_count
                          ) || 0;

                        const priority =
                          safeText(
                            item?.priority,
                            "Low"
                          );

                        const priorityClass =
                          priority.toLowerCase();

                        return (
                          <div
                            className="priority-card"
                            key={`${safeText(
                              item?.skill,
                              "skill"
                            )}-${index}`}
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap: "16px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "flex-start",
                                gap: "16px",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      700,
                                    letterSpacing:
                                      "0.08em",
                                    marginBottom:
                                      "6px",
                                    opacity:
                                      0.65,
                                  }}
                                >
                                  PRIORITY #
                                  {index +
                                    1}
                                </div>

                                <h3>
                                  {safeText(
                                    item?.skill,
                                    "Skill"
                                  )}
                                </h3>
                              </div>

                              <div
                                style={{
                                  textAlign:
                                    "right",
                                  minWidth:
                                    "76px",
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize:
                                      "26px",
                                    lineHeight:
                                      1,
                                  }}
                                >
                                  {score}
                                </strong>

                                <div
                                  style={{
                                    fontSize:
                                      "11px",
                                    marginTop:
                                      "4px",
                                    opacity:
                                      0.65,
                                  }}
                                >
                                  PRIORITY
                                  SCORE
                                </div>
                              </div>
                            </div>

                            <div className="priority-badge-wrapper">
                              <span
                                className={`priority-badge ${priorityClass}`}
                              >
                                {priority}{" "}
                                PRIORITY
                              </span>

                              <span className="priority-growth">
                                +{growth}%
                                growth
                              </span>
                            </div>

                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginTop:
                                  "2px",
                              }}
                            >
                              <div
                                style={{
                                  padding:
                                    "12px",
                                  borderRadius:
                                    "12px",
                                  background:
                                    "rgba(85, 70, 232, 0.06)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "11px",
                                    opacity:
                                      0.65,
                                  }}
                                >
                                  Industry
                                  Demand
                                </div>

                                <strong>
                                  {demand}/100
                                </strong>
                              </div>

                              <div
                                style={{
                                  padding:
                                    "12px",
                                  borderRadius:
                                    "12px",
                                  background:
                                    "rgba(85, 70, 232, 0.06)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "11px",
                                    opacity:
                                      0.65,
                                  }}
                                >
                                  Job
                                  Opportunities
                                </div>

                                <strong>
                                  {jobs.toLocaleString()}
                                </strong>
                              </div>
                            </div>

                            <p
                              style={{
                                margin: 0,
                                lineHeight:
                                  1.6,
                              }}
                            >
                              {safeText(
                                item?.reason,
                                "Recommended based on current industry signals."
                              )}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="roadmap-footer">
                    ✦ Priority score combines
                    industry demand,
                    growth, job
                    opportunities, and
                    skill-gap importance
                    to recommend what to
                    learn next.
                  </div>
                </div>
              )}

              {/* PERSONALIZED ROADMAP */}

              {prioritizedGaps.length >
                0 && (
                <div className="roadmap-section">
                  <div className="roadmap-header">
                    <div className="small-label">
                      PERSONALIZED ROADMAP
                    </div>

                    <h2>
                      Your path to job
                      readiness.
                    </h2>

                    <p>
                      A prioritized learning
                      sequence based on your
                      skill gaps and industry
                      demand.
                    </p>
                  </div>

                  <div className="roadmap-list">
                    {roadmapPrioritySkills.map(
                      (
                        item,
                        index
                      ) => {
                        const demand =
                          Number(
                            item
                              ?.industryData
                              ?.demand_score
                          ) || 0;

                        const growth =
                          Number(
                            item
                              ?.industryData
                              ?.growth_rate
                          ) || 0;

                        const priority =
                          item?.priority ||
                          getPriority(
                            demand
                          );

                        const skillName =
                          safeText(
                            item?.skill,
                            "Skill"
                          );

                        return (
                          <div
                            className="roadmap-item"
                            key={index}
                          >
                            <div className="roadmap-step">
                              <div className="roadmap-circle">
                                {index +
                                  1}
                              </div>

                              {index <
                                roadmapPrioritySkills.length -
                                  1 && (
                                <div className="roadmap-line"></div>
                              )}
                            </div>

                            <div className="roadmap-content">
                              <div className="roadmap-top">
                                <span className="roadmap-stage">
                                  {getRoadmapStage(
                                    index
                                  )}
                                </span>

                                <span
                                  className={`roadmap-priority ${priority.toLowerCase()}`}
                                >
                                  {priority}
                                </span>

                                {item?.priority_score !==
                                  undefined && (
                                  <span className="roadmap-score">
                                    Score:{" "}
                                    {Number(
                                      item.priority_score
                                    ).toFixed(
                                      1
                                    )}
                                  </span>
                                )}
                              </div>

                              <h3>
                                {skillName}
                              </h3>

                              <p>
                                {getRoadmapDescription(
                                  skillName,
                                  index
                                )}
                              </p>

                              <div className="roadmap-details">
                                <span>
                                  Demand:
                                  <strong>
                                    {" "}
                                    {demand}
                                  </strong>
                                </span>

                                <span>
                                  Growth:
                                  <strong>
                                    {" "}
                                    +{growth}%
                                  </strong>
                                </span>

                                <span>
                                  Category:
                                  <strong>
                                    {" "}
                                    {safeText(
                                      item
                                        ?.industryData
                                        ?.category,
                                      "Technology"
                                    )}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="roadmap-footer">
                    ✦ Your roadmap is
                    dynamically prioritized
                    using your current skill
                    gaps and industry demand
                    signals.
                  </div>
                </div>
              )}

              {/* COURSES */}

              <div className="courses-section">
                <div className="learning-header">
                  <div>
                    <span className="small-label">
                      PERSONALIZED LEARNING
                    </span>

                    <h2>
                      Your recommended
                      path.
                    </h2>
                  </div>

                  <div className="ai-badge">
                    ✦ AI RECOMMENDED
                  </div>
                </div>

                <div className="course-list">
                  {recommendations.length >
                  0 ? (
                    recommendations.map(
                      (
                        course,
                        index
                      ) => {
                        const courseName =
                          typeof course ===
                          "string"
                            ? course
                            : course?.course ||
                              course?.title ||
                              "Recommended Course";

                        const provider =
                          typeof course ===
                          "object"
                            ? course?.provider
                            : "";

                        const level =
                          typeof course ===
                          "object"
                            ? course?.level
                            : "";

                        const duration =
                          typeof course ===
                          "object"
                            ? course?.duration
                            : "";

                        const courseSkills =
                          typeof course ===
                          "object"
                            ? course?.skills
                            : [];

                        const coursePriority =
                          typeof course ===
                          "object"
                            ? course?.priority
                            : "";

                        return (
                          <div
                            className="course-card"
                            key={index}
                          >
                            <div className="course-number">
                              0{index + 1}
                            </div>

                            <div className="course-info">
                              <h3>
                                {safeText(
                                  courseName,
                                  "Recommended Course"
                                )}
                              </h3>

                              <p>
                                {safeText(
                                  provider,
                                  "SkillSync AI Learning Recommendation"
                                )}
                              </p>

                              <div className="course-tags">
                                {level && (
                                  <span>
                                    {safeText(
                                      level
                                    )}
                                  </span>
                                )}

                                {duration && (
                                  <span>
                                    {safeText(
                                      duration
                                    )}{" "}
                                    weeks
                                  </span>
                                )}

                                {courseSkills && (
                                  <span>
                                    {Array.isArray(
                                      courseSkills
                                    )
                                      ? courseSkills
                                          .map(
                                            (
                                              s
                                            ) =>
                                              safeText(
                                                s
                                              )
                                          )
                                          .join(
                                            ", "
                                          )
                                      : safeText(
                                          courseSkills
                                        )}
                                  </span>
                                )}

                                {coursePriority && (
                                  <div
                                    style={{
                                      marginTop:
                                        "12px",
                                      fontSize:
                                        "13px",
                                      lineHeight:
                                        1.5,
                                      opacity:
                                        0.75,
                                    }}
                                  >
                                    ✦ Recommended
                                    based on
                                    your skill
                                    gap and
                                    industry
                                    priority.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="course-arrow">
                              →
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="no-courses">
                      No course
                      recommendations are
                      available for the
                      current skill gaps.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ===================================================
              INDUSTRY INTELLIGENCE
              =================================================== */}

          <section
            className="industry-intelligence-section"
            id="industry-intelligence"
          >
            <div className="section-heading">
              <div className="small-label">
                INDUSTRY INTELLIGENCE
              </div>

              <h2>
                Skills the industry is
                looking for.
              </h2>

              <p>
                Explore high-demand and
                emerging skills that are
                shaping today's technology
                job market.
              </p>
            </div>

            <div className="industry-dashboard-grid">
              <div className="industry-panel">
                <div className="industry-panel-header">
                  <div>
                    <span className="panel-label">
                      TOP DEMANDED
                    </span>

                    <h3>
                      Most valuable skills
                    </h3>
                  </div>

                  <span className="panel-icon">
                    📈
                  </span>
                </div>

                <div className="industry-skill-list">
                  {topIndustrySkills.map(
                    (
                      skill,
                      index
                    ) => {
                      const skillName =
                        safeText(
                          skill?.skill
                        );

                      const demand =
                        Number(
                          skill?.demand_score
                        ) || 0;

                      const growth =
                        Number(
                          skill?.growth_rate
                        ) || 0;

                      return (
                        <div
                          className="industry-skill-row"
                          key={`${skillName}-${index}`}
                        >
                          <div className="industry-skill-info">
                            <div className="industry-skill-name">
                              <span className="skill-rank">
                                #{index +
                                  1}
                              </span>

                              <strong>
                                {skillName}
                              </strong>
                            </div>

                            <span className="industry-growth">
                              +{growth}%
                            </span>
                          </div>

                          <div className="industry-demand-track">
                            <div
                              className="industry-demand-fill"
                              style={{
                                width: `${Math.min(
                                  demand,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="industry-demand-footer">
                            <span>
                              Industry
                              demand
                            </span>

                            <strong>
                              {demand}/100
                            </strong>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* EMERGING SKILLS */}

              <div className="industry-panel emerging-panel">
                <div className="industry-panel-header">
                  <div>
                    <span className="panel-label">
                      FUTURE READY
                    </span>

                    <h3>
                      Emerging skills
                    </h3>
                  </div>

                  <span className="panel-icon">
                    🚀
                  </span>
                </div>

                <div className="emerging-skill-list">
                  {emergingSkills
                    .slice(0, 6)
                    .map(
                      (
                        skill,
                        index
                      ) => {
                        const skillName =
                          safeText(
                            skill?.skill
                          );

                        const growth =
                          Number(
                            skill?.growth_rate
                          ) || 0;

                        const demand =
                          Number(
                            skill?.demand_score
                          ) || 0;

                        return (
                          <div
                            className="emerging-skill-card"
                            key={`${skillName}-${index}`}
                          >
                            <div className="emerging-skill-top">
                              <div>
                                <h4>
                                  {
                                    skillName
                                  }
                                </h4>

                                <span>
                                  {safeText(
                                    skill?.category,
                                    "Technology"
                                  )}
                                </span>
                              </div>

                              <div className="growth-badge">
                                +{growth}%
                              </div>
                            </div>

                            <div className="emerging-skill-bottom">
                              <span>
                                Demand score
                              </span>

                              <strong>
                                {demand}/100
                              </strong>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </div>

            {/* INDUSTRY INSIGHT */}

            <div className="industry-insight-box">
              <div className="insight-icon">
                💡
              </div>

              <div>
                <span className="panel-label">
                  SKILLSYNC INSIGHT
                </span>

                <h3>
                  Stay ahead of the skill
                  curve.
                </h3>

                <p>
                  Skills with strong
                  industry demand and high
                  growth rates can help
                  students prepare for
                  emerging career
                  opportunities. Use these
                  insights together with
                  your personalized
                  skill-gap analysis to
                  decide what to learn
                  next.
                </p>
              </div>
            </div>

            {/* PERSONALIZED INDUSTRY ALIGNMENT */}

            <div className="personalized-industry-box">
              <div className="personalized-industry-header">
                <div>
                  <span className="panel-label">
                    YOUR INDUSTRY
                    ALIGNMENT
                  </span>

                  <h3>
                    How your skills align
                    with industry demand.
                  </h3>

                  <p>
                    Your current skills are
                    compared with the
                    industry skill-demand
                    data to identify
                    strengths and
                    opportunities.
                  </p>
                </div>

                <div className="alignment-icon">
                  🎯
                </div>
              </div>

              <div className="alignment-stats">
                <div className="alignment-stat-card">
                  <span className="alignment-stat-number">
                    {
                      alignedIndustrySkills.length
                    }
                  </span>

                  <span className="alignment-stat-label">
                    Industry-aligned
                    skills
                  </span>
                </div>

                <div className="alignment-stat-card">
                  <span className="alignment-stat-number">
                    {
                      highDemandStudentSkills.length
                    }
                  </span>

                  <span className="alignment-stat-label">
                    High-demand
                    skills
                  </span>
                </div>

                <div className="alignment-stat-card">
                  <span className="alignment-stat-number">
                    {
                      emergingStudentSkills.length
                    }
                  </span>

                  <span className="alignment-stat-label">
                    Emerging skills
                  </span>
                </div>
              </div>

              {strongestIndustrySkill && (
                <div className="strongest-alignment">
                  <div className="strongest-alignment-icon">
                    ⭐
                  </div>

                  <div>
                    <span className="strongest-label">
                      STRONGEST INDUSTRY
                      ALIGNMENT
                    </span>

                    <h4>
                      {safeText(
                        strongestIndustrySkill?.studentSkill
                      )}
                    </h4>

                    <p>
                      This skill currently
                      has an industry demand
                      score of{" "}
                      <strong>
                        {Number(
                          strongestIndustrySkill
                            ?.industryData
                            ?.demand_score
                        ) || 0}
                        /100
                      </strong>{" "}
                      with a growth rate of{" "}
                      <strong>
                        +
                        {Number(
                          strongestIndustrySkill
                            ?.industryData
                            ?.growth_rate
                        ) || 0}
                        %
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              )}

              {alignedIndustrySkills.length ===
                0 && (
                <div className="alignment-empty">
                  <span>💡</span>

                  <p>
                    Enter your skills above
                    to see how they align
                    with current industry
                    demand.
                  </p>
                </div>
              )}
            </div>

            {/* SKILL GAP VISUALIZATION */}

            <div className="skill-gap-section">
              <div className="skill-gap-header">
                <div>
                  <span className="panel-label">
                    YOUR SKILL READINESS
                  </span>

                  <h3>
                    Understand your
                    current skill gap.
                  </h3>

                  <p>
                    See which skills you
                    already have and which
                    skills you need to
                    develop for your target
                    role.
                  </p>
                </div>

                <div className="readiness-score-circle">
                  <strong>
                    {readinessScore}%
                  </strong>

                  <span>Ready</span>
                </div>
              </div>

              <div className="skill-gap-stats">
                <div className="skill-gap-stat-card">
                  <span className="skill-gap-stat-number">
                    {
                      matchedSkills.length
                    }
                  </span>

                  <span className="skill-gap-stat-label">
                    Skills Matched
                  </span>
                </div>

                <div className="skill-gap-stat-card">
                  <span className="skill-gap-stat-number">
                    {
                      missingSkills.length
                    }
                  </span>

                  <span className="skill-gap-stat-label">
                    Skills Missing
                  </span>
                </div>

                <div className="skill-gap-stat-card">
                  <span className="skill-gap-stat-number">
                    {totalRequiredSkills}
                  </span>

                  <span className="skill-gap-stat-label">
                    Total Required
                  </span>
                </div>
              </div>

              <div className="skill-gap-progress">
                <div className="skill-gap-progress-header">
                  <span>
                    Skill Coverage
                  </span>

                  <strong>
                    {matchedPercentage}%
                  </strong>
                </div>

                <div className="skill-gap-progress-track">
                  <div
                    className="skill-gap-progress-fill"
                    style={{
                      width: `${matchedPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="skill-gap-columns">
                <div className="skill-gap-column">
                  <div className="skill-gap-column-header">
                    <h4>
                      ✓ Skills You Have
                    </h4>

                    <span>
                      {
                        matchedSkills.length
                      }
                    </span>
                  </div>

                  <div className="skill-chip-list">
                    {matchedSkills.length >
                    0 ? (
                      matchedSkills.map(
                        (
                          skill,
                          index
                        ) => {
                          const skillName =
                            typeof skill ===
                            "string"
                              ? skill
                              : skill?.required_skill ||
                                skill?.skill ||
                                skill?.student_skill ||
                                skill?.matched_skill ||
                                "Skill";

                          return (
                            <span
                              className="skill-chip matched"
                              key={index}
                            >
                              ✓{" "}
                              {safeText(
                                skillName
                              )}
                            </span>
                          );
                        }
                      )
                    ) : (
                      <p className="skill-gap-empty">
                        No matched skills
                        yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="skill-gap-column">
                  <div className="skill-gap-column-header">
                    <h4>
                      ⚡ Skills to Develop
                    </h4>

                    <span>
                      {
                        missingSkills.length
                      }
                    </span>
                  </div>

                  <div className="skill-chip-list">
                    {missingSkills.length >
                    0 ? (
                      missingSkills.map(
                        (
                          skill,
                          index
                        ) => {
                          const skillName =
                            typeof skill ===
                            "string"
                              ? skill
                              : skill?.skill ||
                                skill?.required_skill ||
                                skill?.name ||
                                "Skill";

                          return (
                            <span
                              className="skill-chip missing"
                              key={index}
                            >
                              +{" "}
                              {safeText(
                                skillName
                              )}
                            </span>
                          );
                        }
                      )
                    ) : (
                      <p className="skill-gap-empty">
                        Great! No missing
                        skills detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              CAREER RECOMMENDATIONS
              =================================================== */}

          {careerMatches.length > 0 && (
            <section
              className="career-recommendation-section"
              id="career-matches"
            >
              <div className="section-heading">
                <div className="small-label">
                  AI CAREER MATCHING
                </div>

                <h2>
                  Your best career
                  matches.
                </h2>

                <p>
                  These careers are ranked
                  according to how closely
                  your current skills match
                  their required skills.
                </p>
              </div>

              <div className="career-match-grid">
                {careerMatches
                  .slice(0, 6)
                  .map(
                    (
                      career,
                      index
                    ) => {
                      const role =
                        career?.role ||
                        career?.job_title ||
                        career?.title ||
                        career?.job ||
                        "Career Role";

                      const readiness =
                        Number(
                          career?.readiness ??
                            career?.skill_match ??
                            career?.match_percentage ??
                            career?.match_score ??
                            0
                        );

                      const matched =
                        getArray(
                          career?.matched_skills
                        );

                      const missing =
                        getArray(
                          career?.missing_skills
                        );

                      const industry =
                        Number(
                          career?.industry_alignment ??
                            career?.industry_score ??
                            0
                        );

                      return (
                        <div
                          className={`career-match-card ${
                            index === 0
                              ? "top-career"
                              : ""
                          }`}
                          key={index}
                        >
                          {index === 0 && (
                            <div className="best-match-badge">
                              BEST MATCH
                            </div>
                          )}

                          <div className="career-rank">
                            #{index + 1}
                          </div>

                          <h3>
                            {safeText(
                              role,
                              "Career Role"
                            )}
                          </h3>

                          <div className="readiness-ring">
                            <strong>
                              {Math.round(
                                readiness
                              )}
                              %
                            </strong>

                            <span>
                              Skill Match
                            </span>
                          </div>

                          <div className="career-stat-row">
                            <div>
                              <strong>
                                {
                                  matched.length
                                }
                              </strong>

                              <span>
                                Matched
                              </span>
                            </div>

                            <div>
                              <strong>
                                {
                                  missing.length
                                }
                              </strong>

                              <span>
                                Skill Gaps
                              </span>
                            </div>

                            <div>
                              <strong>
                                {industry
                                  ? industry.toFixed(
                                      2
                                    )
                                  : "—"}
                              </strong>

                              <span>
                                Industry
                              </span>
                            </div>
                          </div>

                          <div className="career-skills">
                            <h4>
                              Skills you
                              already have
                            </h4>

                            {matched.length >
                            0 ? (
                              <div className="career-skill-tags">
                                {matched
                                  .slice(
                                    0,
                                    6
                                  )
                                  .map(
                                    (
                                      skill,
                                      skillIndex
                                    ) => {
                                      const text =
                                        typeof skill ===
                                        "string"
                                          ? skill
                                          : skill?.skill ||
                                            skill?.required_skill ||
                                            skill?.name ||
                                            "";

                                      return (
                                        <span
                                          className="career-skill matched"
                                          key={
                                            skillIndex
                                          }
                                        >
                                          ✓{" "}
                                          {safeText(
                                            text
                                          )}
                                        </span>
                                      );
                                    }
                                  )}
                              </div>
                            ) : (
                              <p className="empty-text">
                                No direct
                                matches yet
                              </p>
                            )}
                          </div>

                          <div className="career-skills">
                            <h4>
                              Skills to
                              develop
                            </h4>

                            {missing.length >
                            0 ? (
                              <div className="career-skill-tags">
                                {missing
                                  .slice(
                                    0,
                                    6
                                  )
                                  .map(
                                    (
                                      skill,
                                      skillIndex
                                    ) => {
                                      const text =
                                        typeof skill ===
                                        "string"
                                          ? skill
                                          : skill?.skill ||
                                            skill?.required_skill ||
                                            skill?.name ||
                                            "";

                                      return (
                                        <span
                                          className="career-skill missing"
                                          key={
                                            skillIndex
                                          }
                                        >
                                          +{" "}
                                          {safeText(
                                            text
                                          )}
                                        </span>
                                      );
                                    }
                                  )}
                              </div>
                            ) : (
                              <p className="empty-text">
                                You already
                                have the
                                required
                                skills.
                              </p>
                            )}
                          </div>

                          <button
                            className="career-action"
                            onClick={() => {
                              const selectedRole =
                                safeText(
                                  role
                                );

                              setTargetRole(
                                selectedRole
                              );

                              setCareerMatches(
                                []
                              );

                              analyzeCareerForRole(
                                selectedRole
                              );
                            }}
                          >
                            View Learning
                            Roadmap →
                          </button>
                        </div>
                      );
                    }
                  )}
              </div>
            </section>
          )}

          {/* ===================================================
              HOW IT WORKS
              =================================================== */}

          <section
            className="how-section"
            id="how-it-works"
          >
            <div className="section-heading">
              <div className="small-label">
                HOW IT WORKS
              </div>

              <h2>
                From skills to career.
              </h2>

              <p>
                SkillSync AI connects student
                capabilities with real-world
                career requirements.
              </p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-number">
                  01
                </div>

                <h3>
                  Tell us your skills
                </h3>

                <p>
                  Enter the technical and
                  professional skills you
                  currently have.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">
                  02
                </div>

                <h3>
                  Analyze your career
                </h3>

                <p>
                  Compare your skills against
                  career requirements and
                  industry demand.
                </p>
              </div>

              <div className="step-line"></div>

              <div className="step">
                <div className="step-number">
                  03
                </div>

                <h3>
                  Get your roadmap
                </h3>

                <p>
                  AI identifies your gaps and
                  recommends what to learn
                  next.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <footer>
          <div className="footer-logo">
            SkillSync <b>AI</b>
          </div>

          <p>
            AI-powered skill alignment for
            the future workforce.
          </p>

          <span>
            SIH 2026 • Building a job-ready
            workforce
          </span>
        </footer>
      </div>
    );
  };

  /* =========================================================
     APP ROUTER
     
     THIS IS THE IMPORTANT PART.
     Navbar is INSIDE BrowserRouter.
     Homepage is rendered through HomePage.
     ========================================================= */
return (
  <>
    <Navbar />
    <HomePage />
  </>
);
  
    

}

export default App;