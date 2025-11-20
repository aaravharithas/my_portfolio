import React from "react";
import Hero from "./components/Hero";
import Resume from "./components/Resume";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import {DataProvider} from "./context/DataContext"

function App() {
  return (
    <>
      <DataProvider>
        <Navbar />
        <Hero />
        <Resume />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </DataProvider>
      {/* <div id="ftco-loader" class="show fullscreen"><svg class="circular" width="48px" height="48px">
		<circle class="path-bg" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke="#eeeeee" />
		<circle class="path" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke-miterlimit="10"
			stroke="#F96D00" />
	</svg></div> */}
    </>
  );
}

export default App;
