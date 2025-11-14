import { motion } from "framer-motion";

const skillsData = {
  heading: {
    title: "Skills",
    subtitle: "My Skills",
    description:
      "Here you will find more information about my current skills mostly in terms of programming and technology",
  },
  skills: [
    { name: "Python", value: 60, color: "color-1" },
    { name: "Javascript", value: 30, color: "color-2" },
    { name: "Photoshop", value: 90, color: "color-3" },
    { name: "jQuery", value: 85, color: "color-4" },
    { name: "HTML5", value: 95, color: "color-5" },
    { name: "CSS3", value: 90, color: "color-6" },
    { name: "WordPress", value: 70, color: "color-1" },
    { name: "SEO", value: 80, color: "color-2" },
  ],
};

function Skills() {
  return (
    <section className="ftco-section" id="skills-section">
      <div className="container">
        {/* Section Heading */}
        <motion.div
          className="row justify-content-center pb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-md-12 heading-section text-center">
            <h1 className="big big-2">{skillsData.heading.title}</h1>
            <h2 className="mb-4">{skillsData.heading.subtitle}</h2>
            <p>{skillsData.heading.description}</p>
          </div>
        </motion.div>

        {/* Skills */}
        <div className="row">
          {skillsData.skills.map((skill, idx) => (
            <div className="col-md-6 animate-box" key={skill.name}>
              <motion.div
                className="progress-wrap"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>{skill.name}</h3>
                <div className="progress">
                  <motion.div
                    className={`progress-bar ${skill.color}`}
                    role="progressbar"
                    aria-valuenow={skill.value}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.value}%` }}
                    viewport={{ once: false }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: "easeOut" }}
                    whileHover={{ scaleY: 1.05 }}
                  >
                    <span>{skill.value}%</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
