import React from "react";
import LandingPage from "./pages/LandingPage";
// import AboutPage from "./pages/AboutPage";         // Member 2
// import ResultsPage from "./pages/ResultsPage";     // Member 3
// import DashboardPage from "./pages/DashboardPage"; // Member 4

// Replace this with your real router (react-router-dom) once everyone's
// pages are ready. For now this just renders the landing page, and shows
// where each teammate's page will plug in.
export default function App() {
  // Member 3 will replace this with a real API call:
  //   const res = await fetch("/predict", { method: "POST", body: formData });
  //   then route to ResultsPage with the response.
  const handleAnalyze = async (file) => {
    console.log("TODO: send to backend /predict:", file.name);
  };

  return <LandingPage onAnalyze={handleAnalyze} />;
}
