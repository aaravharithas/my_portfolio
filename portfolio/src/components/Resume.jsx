import { motion } from "framer-motion";

const resumeData = {
  heading: {
    title: "Experience",
    subtitle: "Education",
    description:
      "I love bringing ideas to life through code — crafting full-stack applications powered by MERN and Python that are fast, functional, and user-focused.",
  },
  education: [
    {
      date: "2014-2015",
      degree: "Master Degree of Design",
      institution: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
    {
      date: "2014-2015",
      degree: "Bachelor's Degree of C.A",
      institution: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
    {
      date: "2014-2015",
      degree: "Diploma in Computer",
      institution: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
  ],
  experience: [
    {
      date: "2014-2015",
      role: "Art & Creative Director",
      company: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
    {
      date: "2014-2015",
      role: "WordPress Developer",
      company: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
    {
      date: "2017-2018",
      role: "UI/UX Designer",
      company: "Cambridge University",
      description:
        "A small river named Duden flows by their place and supplies it with the necessary regelialia...",
    },
  ],
  cvLink: "#",
};

function Resume() {
  // Variants for left/right sliding
  const leftSlide = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  const rightSlide = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="ftco-section ftco-no-pb" id="resume-section">
      <div className="container">
        {/* Heading */}
        <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <div className="col-md-10 heading-section text-center">
            <h1 className="big big-2">{resumeData.heading.title}</h1>
            <h2 className="mb-4">{resumeData.heading.subtitle}</h2>
            <p>{resumeData.heading.description}</p>
          </div>
        </motion.div>

        <div className="row">
          {/* Education Column */}
          <div className="col-md-6">
            {resumeData.education.map((edu, idx) => (
              <motion.div
                key={idx}
                className="resume-wrap"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={leftSlide}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="date">{edu.date}</span>
                <h2>{edu.degree}</h2>
                <span className="position">{edu.institution}</span>
                <p className="mt-4">{edu.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Experience Column */}
          <div className="col-md-6">
            {resumeData.experience.map((exp, idx) => (
              <motion.div
                key={idx}
                className="resume-wrap"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={rightSlide}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="date">{exp.date}</span>
                <h2>{exp.role}</h2>
                <span className="position">{exp.company}</span>
                <p className="mt-4">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Download CV */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-6 text-center">
            <p>
              <a href={resumeData.cvLink} className="btn btn-primary py-4 px-5">
                Download CV
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resume;
