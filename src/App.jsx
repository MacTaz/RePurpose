import { useState } from "react";
import supabase from "./database-auth/supabase-client";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home/Home';
import Donate from './pages/Donate/Donate';
import Profile from './pages/Profile/Profile';
import Manage from './pages/Manage/Manage';
import Landing from './pages/Landing/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything inside this Route will have the Navbar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="donate" element={<Donate />} />
          <Route path="profile" element={<Profile />} />
          <Route path="manage" element={<Manage />} />
          <Route path="landing" element={<Landing />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
