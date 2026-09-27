import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const userEmail =
    localStorage.getItem("skillsync_user_email") || "";

  const profileKey =
    `skillsync_student_profile_${userEmail}`;

  const [studentName, setStudentName] = useState("");
  const [college, setCollege] = useState("");

 const [branch, setBranch] = useState("");

  const [year, setYear] = useState("");

  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
useEffect(() => {
  // Reset the form first for the current user
  setStudentName("");
  setCollege("");
 setBranch("");
setYear("");
  setSaved(false);

  const data = localStorage.getItem(profileKey);
  

  if (!data) {
    return;
  }

  try {
    const profile = JSON.parse(data);

    setStudentName(profile.studentName || "");
    setCollege(profile.college || "");

setBranch(profile.branch || "");
setYear(profile.year || "");

    setSaved(true);
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
}, [profileKey]);

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

    setSaved(true);
navigate("/home");
  };

  return (
    <main
      style={{
        padding: "70px 8%",
        background: "#f8f9ff",
        minHeight: "80vh",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <div style={{ marginBottom: "35px" }}>
  <span
    style={{
      color: "#5546e8",
      fontWeight: "700",
      fontSize: "14px",
      letterSpacing: "1px",
    }}
  >
    STUDENT PROFILE
  </span>

  <h1
    style={{
      fontSize: "42px",
      margin: "10px 0",
      color: "#111827",
    }}
  >
    Build your career profile.
  </h1>

  <p
    style={{
      color: "#6b7280",
      fontSize: "17px",
      margin: 0,
    }}
  >
    Tell SkillSync AI a little about yourself so we can
    personalize your career journey.
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
          <div style={gridStyle}>
            <FormField
              label="Student Name"
              value={studentName}
              onChange={setStudentName}
              placeholder="Enter your name"
            />

            <FormField
              label="College / University"
              value={college}
              onChange={setCollege}
              placeholder="Enter your college"
            />

            <div>
              <label>Branch</label>

              <select
                value={branch}
                onChange={(e) =>
                  setBranch(e.target.value)
                }
                style={inputStyle}
              >
                <option value="" disabled>
  Select your branch
</option>
                <option>
                  Computer Science and Engineering
                </option>
                <option>Information Technology</option>
                <option>Artificial Intelligence</option>
                <option>Data Science</option>
                <option>
                  Electronics and Communication
                </option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
              </select>
            </div>

            <div>
              <label>Current Year</label>

              <select
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                style={inputStyle}
              >
                <option value="" disabled>
  Select your year
</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Graduate</option>
              </select>
            </div>
          </div>

          <button
            onClick={saveProfile}
            style={{
              marginTop: "30px",
              padding: "14px 25px",
              border: "none",
              borderRadius: "10px",
              background: "#5546e8",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Save Profile
          </button>

          {saved && (
            <span
              style={{
                marginLeft: "15px",
                color: "#16a34a",
                fontWeight: "600",
              }}
            >
              ✓ Profile saved
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label>{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px",
};

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

export default Profile;