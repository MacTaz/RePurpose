import { useState } from "react";
import supabase from "./database-auth/supabase-client";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home.jsx';
import Donate from './pages/Donate.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything inside this Route will have the Navbar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="donate" element={<Donate />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
