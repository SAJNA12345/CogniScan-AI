import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CognitiveTest from "./pages/CognitiveTest";
import Results from "./pages/Results";
import Progress from "./pages/Progress";
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import PatternTest from "./pages/PatternTest";
import RiskFactors from "./pages/RiskFactors";
import FunctionalAssessment from "./pages/FunctionalAssessment";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → Home */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/pattern" element={<PatternTest />} />
        <Route path="/risk" element={<RiskFactors />} />
        <Route path="/functional" element={<FunctionalAssessment />} />

        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/cognitive" element={<CognitiveTest />} />
        <Route path="/results" element={<Results />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/report" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />

      </Routes>
    </BrowserRouter>
  );
}