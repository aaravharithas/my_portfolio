import React from "react";
import Hero from "./components/Hero";
import Resume from "./components/Resume";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import {DataProvider} from "./context/DataContext"
import MeshBackground from "./backgrounds/MeshBackground";
import GlassBubblesBackground from "./backgrounds/GlassBubblesBackground";
import SoftBlobsBackground from "./backgrounds/SoftBlobsBackground";
import MagneticParticles from "./backgrounds/MagneticParticles";
import RGBLightTrails from "./backgrounds/RGBLightTrails";
import BlobDistortionBackground from "./backgrounds/BlobDistortionBackground";
import CombinedBackground from "./backgrounds/CombinedBackground";
import ParallaxGlassLayers from "./backgrounds/ParallaxGlassLayers";
import CyberneticParticleNodes from "./backgrounds/CyberneticParticleNodes";
import NeonParticleFlocks from "./backgrounds/NeonParticleFlocks";
import NeonTriangulatedMesh from "./backgrounds/NeonTriangulatedMesh";
import CombinedBackgroundLight from "./backgrounds/CombinedBackgroundLight";
import CombinedBackgroundHeavy from "./backgrounds/CombinedBackgroundHeavy";

function App() {
  return (
    <>
      <DataProvider>
        {/* Background must render before content to sit behind it */}
        {/* <MeshBackground/> */}
        {/* <GlassBubblesBackground/> */}
        {/* <BlobDistortionBackground/> */}
        {/* <SoftBlobsBackground/> */}

        {/* <RGBLightTrails/> */}
        {/* <MagneticParticles/> */}
        
        {/* <CombinedBackgroundLight/> */}
        <CombinedBackground/>
        {/* <CombinedBackgroundHeavy/> */}
        
        {/* <ParallaxGlassLayers/> */}
        
        {/* <CyberneticParticleNodes/> */}
        {/* <NeonParticleFlocks/> */}
        {/* <NeonTriangulatedMesh/> */}
        {/* It Ensure content draws above the canvas (z-index > 0 on nav / sections if needed) */}
        <Navbar />
        <Hero />
        <Resume />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </DataProvider>
    </>
  );
}

export default App;
