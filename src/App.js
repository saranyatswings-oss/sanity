// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./Components/HomePage";
import "./Components/Home.css";
import Contact from "./Components/contact";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
