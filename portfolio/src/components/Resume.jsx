import { motion } from "framer-motion";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function Resume() {
  const { data } = useContext(DataContext);

  // Safety checks
  const education = data?.education || [];
  const experience = data?.experience || [];
  const cvLink = data?.cvLink || "#";

  const resumeData = {
    heading: {
      title: "Experience & Education",
      description:
        "I love bringing ideas to life through code — crafting full-stack applications powered by MERN and Python that are fast, functional, and user-focused.",
    },
    timeline: [
      ...experience.map((e) => ({ ...e, type: "experience" })),
      ...education.map((e) => ({ ...e, type: "education" })),
    ],
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
            <p>{resumeData.heading.description}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="timeline">
          {resumeData.timeline.map((item, idx) => {
            const isLeft = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                className={`timeline-item ${isLeft ? "left" : "right"}`}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="date">{item.date}</span>
                <h2>{item.type === "education" ? item.degree : item.role}</h2>
                <span className="position">
                  {item.type === "education" ? item.institution : item.company}
                </span>
                <p className="mt-4">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Download CV */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-6 text-center">
            <p>
              <a
                href={cvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary py-4 px-5"
              >
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
