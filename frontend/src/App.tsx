import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import CognitiveInterview from "./pages/CognitiveInterview";
import Voice from "./pages/Voice";
import CognitiveTest from "./pages/CognitiveTest";
import PatternTest from "./pages/PatternTest";
import RiskFactors from "./pages/RiskFactors";
import FunctionalAssessment from "./pages/FunctionalAssessment";
import Results from "./pages/Results";
import Progress from "./pages/Progress";
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/interview" element={<CognitiveInterview />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/cognitive" element={<CognitiveTest />} />
        <Route path="/pattern" element={<PatternTest />} />
        <Route path="/risk" element={<RiskFactors />} />
        <Route path="/functional" element={<FunctionalAssessment />} />

        <Route path="/results" element={<Results />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/report" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
