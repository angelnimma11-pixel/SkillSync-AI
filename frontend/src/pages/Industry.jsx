import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
function Industry() {
  const [skills, setSkills] = useState([]);
  const [emerging, setEmerging] = useState([]);
  const [jobMarket, setJobMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
 

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        const demandResponse = await fetch(
         `${API_BASE}/industry/demand`
        );

        const demandData = await demandResponse.json();

        if (!demandResponse.ok) {
          throw new Error(
            demandData.detail ||
              demandData.message ||
              "Unable to load industry demand."
          );
        }
const emergingResponse = await fetch(
  `${API_BASE}/industry/emerging`
);
        const emergingData =
          await emergingResponse.json();

        if (!emergingResponse.ok) {
          throw new Error(
            emergingData.detail ||
              emergingData.message ||
              "Unable to load emerging skills."
          );
        }

        setSkills(
          Array.isArray(demandData.skills)
            ? demandData.skills
            : []
        );

        setEmerging(
          Array.isArray(
            emergingData.emerging_skills
          )
            ? emergingData.emerging_skills
            : []
        );
   

const jobsResponse = await fetch(
  `${API_BASE}/industry/jobs`
);

const jobsData = await jobsResponse.json();

if (!jobsResponse.ok) {
  throw new Error(
    jobsData.detail ||
      jobsData.message ||
      "Unable to load job market data."
  );
}

setJobMarket(jobsData);
      } catch (error) {
        console.error("Industry data error:", error);

        setError(
          error.message ||
            "Unable to connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
            INDUSTRY INTELLIGENCE
          </span>

          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#111827",
            }}
          >
            Skills the industry is looking for.
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
            }}
          >
            Explore high-demand and emerging
            technology skills to understand where
            the job market is heading.
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
            <h3>Loading industry intelligence...</h3>
            <p style={{ color: "#6b7280" }}>
              Fetching the latest available skill
              demand data.
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
            <section>
             <div style={{ marginBottom: "20px" }}>
  <h2
    style={{
      margin: 0,
      fontSize: "26px",
      color: "#111827",
    }}
  >
    Top Demanded Skills
  </h2>

  <p
    style={{
      margin: "6px 0 0",
      color: "#6b7280",
      fontSize: "15px",
    }}
  >
    Skills with strong demand across the available job market data.
  </p>
</div>

              {skills.length === 0 ? (
                <EmptyState text="No industry demand data available." />
              ) : (
                <div style={gridStyle}>
                  {skills
                    .slice(0, 10)
                    .map((skill, index) => (
                      <SkillCard
                        key={index}
                        skill={skill}
                        rank={index + 1}
                      />
                    ))}
                </div>
              )}
            </section>
                    

            {/* Industry Demand Visualization */}
            {skills.length > 0 && (
              <section style={{ marginTop: "45px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      color: "#111827",
                    }}
                  >
                    Industry Demand Overview
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#6b7280",
                      fontSize: "15px",
                    }}
                  >
                    Visual comparison of the most demanded skills in the
                    available industry data.
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
                  {skills.slice(0, 8).map((skill, index) => {
                    const demand = Number(
                      skill?.demand_score ?? 0
                    );

                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom:
                            index === Math.min(skills.length, 8) - 1
                              ? 0
                              : "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "7px",
                          }}
                        >
                          <span
                            style={{
                              color: "#374151",
                              fontWeight: "700",
                              fontSize: "14px",
                            }}
                          >
                            {skill?.skill || "Skill"}
                          </span>

                          <span
                            style={{
                              color: "#5546e8",
                              fontWeight: "800",
                              fontSize: "14px",
                            }}
                          >
                            {demand}/100
                          </span>
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
                                Math.max(demand, 0),
                                100
                              )}%`,
                              height: "100%",
                              background: "#5546e8",
                              borderRadius: "20px",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            

            <section style={{ marginTop: "55px" }}>
              <div style={{ marginBottom: "20px" }}>
  <h2
    style={{
      margin: 0,
      fontSize: "26px",
      color: "#111827",
    }}
  >
    Emerging Skills
  </h2>

  <p
    style={{
      margin: "6px 0 0",
      color: "#6b7280",
      fontSize: "15px",
    }}
  >
    Growing skills that can help students prepare for future opportunities.
  </p>
</div>

              {emerging.length === 0 ? (
                <EmptyState text="No emerging skill data available." />
              ) : (
                <div style={gridStyle}>
                  {emerging
                    .slice(0, 10)
                    .map((skill, index) => (
                      <SkillCard
                        key={index}
                        skill={skill}
                        rank={index + 1}
                        emerging
                      />
                    ))}
                </div>
              )}
            </section>
                        {/* Emerging Skills Growth Visualization */}
            {emerging.length > 0 && (
              <section style={{ marginTop: "45px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      color: "#111827",
                    }}
                  >
                    Emerging Skills Growth
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#6b7280",
                      fontSize: "15px",
                    }}
                  >
                    Skills showing the strongest growth in the available
                    industry data.
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
                  {emerging.slice(0, 8).map((skill, index) => {
                    const growth = Number(
                      skill?.growth_rate ?? 0
                    );

                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom:
                            index === Math.min(emerging.length, 8) - 1
                              ? 0
                              : "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "7px",
                          }}
                        >
                          <span
                            style={{
                              color: "#374151",
                              fontWeight: "700",
                              fontSize: "14px",
                            }}
                          >
                            {skill?.skill || "Skill"}
                          </span>

                          <span
                            style={{
                              color: "#16a34a",
                              fontWeight: "800",
                              fontSize: "14px",
                            }}
                          >
                            +{growth}%
                          </span>
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
                                Math.max(growth, 0),
                                100
                              )}%`,
                              height: "100%",
                              background: "#16a34a",
                              borderRadius: "20px",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
        <section style={{ marginTop: "55px" }}>
  <div style={{ marginBottom: "20px" }}>
    <h2
      style={{
        margin: 0,
        fontSize: "26px",
        color: "#111827",
      }}
    >
      Live Job Market
    </h2>

    <p
      style={{
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "15px",
      }}
    >
      Real-time fresher and entry-level hiring signals from the Hopin job market.
    </p>
  </div>

  {!jobMarket ? (
    <EmptyState text="No live job market data available." />
  ) : (
    <>
      <div style={jobMarketGridStyle}>
        <MarketStat
          label="Jobs Found"
          value={jobMarket.total_jobs}
        />

        <MarketStat
          label="Top Location"
          value={
            jobMarket.top_locations?.[0]?.location ||
            "N/A"
          }
        />

        <MarketStat
          label="Top Role"
          value={
            jobMarket.top_roles?.[0]?.role ||
            "N/A"
          }
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <MarketList
          title="Top Hiring Companies"
          items={jobMarket.top_companies || []}
          nameKey="company"
        />

        <MarketList
          title="Top Hiring Locations"
          items={jobMarket.top_locations || []}
          nameKey="location"
        />

        <MarketList
          title="Popular Roles"
          items={jobMarket.top_roles || []}
          nameKey="role"
        />
      </div>
    </>
  )}
</section>
      </div>
    </main>
  );
}

function SkillCard({ skill, rank, emerging }) {
  const demand = Number(skill?.demand_score ?? 0);
  const growth = Number(skill?.growth_rate ?? 0);

  return (
    <div
      style={{
        background: "white",
       padding: "28px",
borderRadius: "18px",
border: "1px solid #eef0f6",
boxShadow:
  "0 8px 25px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#5546e8",
          fontWeight: "700",
          marginBottom: "10px",
        }}
      >
        #{rank} {emerging ? "• EMERGING" : ""}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          color: "#111827",
        }}
      >
        {skill?.skill || "Skill"}
      </h3>

      <p
        style={{
          color: "#6b7280",
          marginTop: 0,
        }}
      >
        {skill?.category || "Technology"}
      </p>

      <div style={{ marginTop: "18px" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "7px",
      fontSize: "14px",
      fontWeight: "700",
    }}
  >
    <span>Demand</span>
    <span>{demand}/100</span>
  </div>

  <div
    style={{
      width: "100%",
      height: "8px",
      background: "#e5e7eb",
      borderRadius: "20px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(Math.max(demand, 0), 100)}%`,
        height: "100%",
        background: "#5546e8",
        borderRadius: "20px",
      }}
    />
  </div>
</div>

      <div
        style={{
          marginTop: "8px",
          color: "#16a34a",
          fontWeight: "600",
        }}
      >
        +{growth}% growth
      </div>
    </div>
  );
}
function MarketStat({ label, value }) {
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
          marginTop: "8px",
          color: "#5546e8",
          fontSize: "26px",
          fontWeight: "800",
        }}
      >
        {value}
      </div>
    </div>
  );
}


function MarketList({ title, items, nameKey }) {
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
      <h3
        style={{
          margin: "0 0 18px",
          color: "#111827",
        }}
      >
        {title}
      </h3>

      {items.length === 0 ? (
        <p style={{ color: "#6b7280" }}>
          No data available.
        </p>
      ) : (
        items.slice(0, 5).map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              padding: "12px 0",
              borderBottom:
                index < Math.min(items.length, 5) - 1
                  ? "1px solid #f0f1f5"
                  : "none",
            }}
          >
            <span
              style={{
                color: "#374151",
                fontWeight: "600",
              }}
            >
              {index + 1}. {item[nameKey]}
            </span>

            <span
              style={{
                color: "#5546e8",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {item.job_count}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        color: "#6b7280",
      }}
    >
      {text}
    </div>
  );
}
const jobMarketGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

export default Industry;