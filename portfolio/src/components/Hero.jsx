import React from "react";
import { motion } from "framer-motion";

const heroData = {
  greeting: "Hello!",
  name: "Gaurav Sharma",
  title: "A Fullstack Backend Developer",
  buttons: [
    { label: "Hire me", href: "#", style: { backgroundColor: "#f5b700", color: "#000", fontWeight: 600, borderRadius: "50px", border: "none", padding: "12px 25px", marginRight: "10px" } },
    { label: "My works", href: "#", style: { backgroundColor: "transparent", color: "#fff", fontWeight: 600, border: "2px solid #fff", borderRadius: "50px", padding: "12px 25px" } },
  ],
  about: {
    heading: "About Me",
    description: "Always learning, always building — because great software starts with curiosity and persistence.",
    info: [
      { label: "Name", value: "Gaurav Sharma" },
      { label: "Date of birth", value: "August 11, 2002" },
      { label: "Address", value: "Gurgaon, Haryana" },
      { label: "Zip code", value: "122001" },
      { label: "Email", value: "aaravharithas@gmail.com" },
      { label: "Phone", value: "+91-9321-666-720" },
    ],
    cvLink: "#",
  },
};

function Hero() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 70 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const floatEffect = {
    initial: { y: 0 },
    animate: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 3 } },
  };

  return (
    <section
      id="home-about-section"
      className="hero ftco-about img ftco-section ftco-no-pb"
      style={{ paddingTop: "120px" }}
    >
      <div className="container">
        <div className="row d-flex align-items-center justify-content-between">

          {/* LEFT COLUMN (HERO TEXT) */}
          <motion.div
            className="col-md-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={fadeInUp}
          >
            <motion.div
              className="text"
              style={{ color: "#fff", fontFamily: "Poppins, sans-serif" }}
              variants={floatEffect}
              animate="animate"
            >
              <span
                className="subheading"
                style={{
                  color: "#f5b700",
                  fontWeight: "600",
                  letterSpacing: "2px",
                  fontSize: "14px",
                  textTransform: "uppercase",
                }}
              >
                {heroData.greeting}
              </span>

              <h1
                className="mb-4 mt-3"
                style={{ fontSize: "64px", fontWeight: "800", lineHeight: "1.1", margin: "15px 0" }}
              >
                I'm <span style={{ color: "#f5b700" }}>{heroData.name}</span>
              </h1>

              <h2 className="mb-4">{heroData.title}</h2>

              <p style={{ marginTop: "30px" }}>
                {heroData.buttons.map((btn, idx) => (
                  <a key={idx} href={btn.href} style={btn.style}>
                    {btn.label}
                  </a>
                ))}
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN (ABOUT SECTION) */}
          <motion.div
            className="col-md-6 col-lg-6 pl-lg-5 pb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="overlay"></div>

            <div className="heading-section">
              <h1 className="big">About</h1>
              <h2 className="mb-4">{heroData.about.heading}</h2>

              <p>{heroData.about.description}</p>

              <ul className="about-info mt-4 px-md-0 px-2">
                {heroData.about.info.map((item, idx) => (
                  <li className="d-flex" key={idx}>
                    <span>{item.label}:</span> <span>{item.value}</span>
                  </li>
                ))}
              </ul>

              <div className="counter-wrap d-flex mt-md-3">
                <div className="text">
                  <p>
                    <a href={heroData.about.cvLink} className="btn btn-primary py-3 px-3">
                      Download CV
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
