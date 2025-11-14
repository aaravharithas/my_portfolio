import React from "react";
import Hero from "./components/Hero";
import Resume from "./components/resume";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
// import Hero from "./Hero.jsx";

function App() {
  return (
    <>
    {/* <h1>this is demo heading.</h1> */}
      <Navbar/>
      <Hero />
      <Resume/>
      <Skills/>
      <Projects/>
      <Contact/>
      <Footer/>
      {/* You can add other sections here */}
    </>
  );
}

export default App;
