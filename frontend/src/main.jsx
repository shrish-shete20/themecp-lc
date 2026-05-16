import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./auth.jsx";
import "./lib/authenticatedAxios.js";

// < 1200	Newbie	=> 1000 to 1299, Gray
// 1200 – 1399	  => 1300 to 1599, Pupil	Green
// 1400 – 1599	  => 1600 to 1899, Specialist	Cyan
// 1600 – 1899	  => 1900 to 2199, Expert	Blue
// 1900 – 2099	  => 2200 to 2499, Candidate Master	Purple
// 2100 – 2299	  => 2500 to 2799, Master	Orange
// 2300 – 2399	  => 2800 to 3099, International Master	Orange
// 2400 – 2599	  => 3100 to 3399, Grandmaster	Red
// 2600 – 2999	  => 3400 to 3699, International Grandmaster	Red
// ≥ 3000

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)