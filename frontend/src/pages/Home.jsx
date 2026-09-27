import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <section
        style={{
          padding: "100px 8%",
          background: "#f8f9ff",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "#5546e8",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            ✦ AI-POWERED CAREER INTELLIGENCE
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: "1.1",
              marginBottom: "24px",
            }}
          >
            Align your skills with
            <span
              style={{
                display: "block",
                color: "#5546e8",
              }}
            >
              the future of work.
            </span>
          </h1>

          <p
            style={{
              fontSize: "19px",
              color: "#6b7280",
              maxWidth: "700px",
              margin: "0 auto 35px",
              lineHeight: "1.7",
            }}
          >
            Discover the skills employers need, identify your
            career gaps, and build a personalized path to become
            job-ready.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/career-analysis"
              style={{
                background: "#5546e8",
                color: "white",
                padding: "14px 25px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Analyze My Skills →
            </Link>

            <Link
              to="/profile"
              style={{
                border: "1px solid #5546e8",
                color: "#5546e8",
                padding: "14px 25px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Create Profile
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "70px 8%",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          How SkillSync AI works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
            marginTop: "40px",
          }}
        >
          <Feature
            number="01"
            title="Enter your skills"
            text="Tell us about the technical and professional skills you currently have."
          />

          <Feature
            number="02"
            title="Analyze your career"
            text="Compare your skills against the requirements of your target career."
          />

          <Feature
            number="03"
            title="Get your roadmap"
            text="Discover your skill gaps and the skills you should learn next."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ number, title, text }) {
  return (
    <div
      style={{
        padding: "30px",
        borderRadius: "18px",
        background: "#f8f9ff",
      }}
    >
      <div
        style={{
          color: "#5546e8",
          fontWeight: "800",
          marginBottom: "15px",
        }}
      >
        {number}
      </div>

      <h3>{title}</h3>

      <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
        {text}
      </p>
    </div>
  );
}

export default Home; 