import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        SkillSync <span>AI</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/career-analysis">Career Analysis</Link>
        <Link to="/roadmap">Roadmap</Link>
        <Link to="/industry">Industry</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/institute">Institute</Link>
      </div>

      <Link to="/login" className="nav-button">
        Login
      </Link>
    </nav>
  );
}

export default Navbar;