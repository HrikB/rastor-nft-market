import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavHeader from "./components/NavHeader";
import Home from "./components/Home";
import CreateItem from "./components/CreateItem";
import MyAssets from "./components/MyAssets";
import CreatorDashboard from "./components/CreatorDashboard";

function App() {
  return (
    <Router>
      <NavHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-item" element={<CreateItem />} />
        <Route path="/my-assets" element={<MyAssets />} />
        <Route path="/creator-dashboard" element={<CreatorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
