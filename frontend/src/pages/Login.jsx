import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const emailRef = useRef(null);
const passwordRef = useRef(null);
useEffect(() => {
  const clearAutofill = () => {
    if (emailRef.current && !email) {
      emailRef.current.value = "";
    }

    if (passwordRef.current && !password) {
      passwordRef.current.value = "";
    }
  };

  const timer = setTimeout(clearAutofill, 300);

  return () => clearTimeout(timer);
}, []);

const handleLogin = (e) => {
  e.preventDefault();
  setError("");

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    setError("Please enter your email and password.");
    return;
  }

  const users = JSON.parse(
    localStorage.getItem("skillsync_users") || "[]"
  );

  if (isSignUp) {
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingUser = users.find(
      (user) => user.email === normalizedEmail
    );

    if (existingUser) {
      setError(
        "An account with this email already exists. Please sign in."
      );
      return;
    }

    const newUser = {
      email: normalizedEmail,
      password,
    };

    const updatedUsers = [
      ...users,
      newUser,
    ];

    localStorage.setItem(
      "skillsync_users",
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      "skillsync_logged_in",
      "true"
    );

    localStorage.setItem(
      "skillsync_user_email",
      normalizedEmail
    );

    navigate("/home");
    return;
  }

  const existingUser = users.find(
    (user) =>
      user.email === normalizedEmail &&
      user.password === password
  );

  if (!existingUser) {
    setError("Invalid email or password.");
    return;
  }

  localStorage.setItem(
    "skillsync_logged_in",
    "true"
  );

  localStorage.setItem(
    "skillsync_user_email",
    normalizedEmail
  );

  navigate("/home");
};

 

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 20px",
        background: "#f8f9ff",
      }}
    >
     <div
  style={{
    width: "100%",
    maxWidth: "450px",
    background: "white",
    padding: "42px",
    borderRadius: "22px",
    border: "1px solid #eef0f6",
    boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
  }}
>
        <span
          style={{
            color: "#5546e8",
            fontWeight: "700",
            fontSize: "13px",
            letterSpacing: "1px",
          }}
        >
          SKILLSYNC AI
        </span>

        <h1
          style={{
            fontSize: "36px",
            margin: "10px 0",
            color: "#111827",
          }}
        >
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>

      <p style={{ color: "#6b7280" }}>
  {isSignUp
    ? "Create your account to start your SkillSync AI journey."
    : "Login to continue your SkillSync AI journey."}
</p>

        <form onSubmit={handleLogin}>
          {isSignUp && (
  <div style={{ marginTop: "25px" }}>
    <label>Name</label>

    <input
      type="text"
      placeholder="Enter your name"
      style={inputStyle}
    />
  </div>
)}
          <div style={{ marginTop: "25px" }}>
            <label>Email</label>

            <input
            ref={emailRef}
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              style={inputStyle}
            />
          </div>
          {isSignUp && (
  <div style={{ marginTop: "20px" }}>
    <label>Confirm Password</label>

   <input
  type="password"
  value={confirmPassword}
  onChange={(e) =>
    setConfirmPassword(e.target.value)
  }
  placeholder="Confirm your password"
  autoComplete="new-password"
  style={inputStyle}
/>
  </div>
)}

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
           style={{
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "#5546e8",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px",
  boxShadow: "0 8px 20px rgba(85, 70, 232, 0.25)",
}}
          >
            {isSignUp ? "Create Account →" : "Login →"}
          </button>
        </form>

       <p
  style={{
    marginTop: "20px",
    textAlign: "center",
  }}
>
  {isSignUp ? (
    <>
      Already have an account?{" "}
      <button
        type="button"
        onClick={() => {
          setIsSignUp(false);
          setError("");
        }}
        style={{
          border: "none",
          background: "none",
          color: "#5546e8",
          fontWeight: "700",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Sign In
      </button>
    </>
  ) : (
    <>
      New to SkillSync AI?{" "}
      <button
        type="button"
        onClick={() => {
          setIsSignUp(true);
          setError("");
        }}
        style={{
          border: "none",
          background: "none",
          color: "#5546e8",
          fontWeight: "700",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Create Account
      </button>
    </>
  )}
</p>
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
export default Login;