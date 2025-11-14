import React from "react";
import Hero from "./components/Hero";
import Resume from "./components/Resume";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Resume />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}

export default App;
