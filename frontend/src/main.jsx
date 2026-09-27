import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Navbar from "./Navbar.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import CareerAnalysis from "./pages/CareerAnalysis.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Industry from "./pages/Industry.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import Institute from "./pages/Institute.jsx";

import "./index.css";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Login />} />
       <Route path="/home" element={<App />} />

        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        <Route
          path="/career-analysis"
          element={
            <Layout>
              <CareerAnalysis />
            </Layout>
          }
        />

        <Route
          path="/roadmap"
          element={
            <Layout>
              <Roadmap />
            </Layout>
          }
        />

        <Route
          path="/industry"
          element={
            <Layout>
              <Industry />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
  path="/jobs"
  element={
    <Layout>
      <Jobs />
    </Layout>
  }
/>
<Route
  path="/institute"
  element={
    <Layout>
      <Institute />
    </Layout>
  }
/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);