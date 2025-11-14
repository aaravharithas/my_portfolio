import { motion } from "framer-motion";

// Data object for projects
const projectsData = {
  heading: {
    title: "Projects",
    subtitle: "Our Projects",
    description:
      "Here you will find some of the personal projects that I created, each containing its own case study.",
  },
  projects: [
    { img: "/images/project-4.jpg", title: "Project 1", subtitle: "Web Design", link: "#" },
    { img: "/images/project-5.jpg", title: "Project 2", subtitle: "Web Design", link: "#" },
    { img: "/images/project-1.jpg", title: "Project 3", subtitle: "Web Design", link: "#" },
    { img: "/images/project-6.jpg", title: "Project 4", subtitle: "Web Design", link: "#" },
    { img: "/images/project-2.jpg", title: "Project 5", subtitle: "Web Design", link: "#" },
    { img: "/images/project-3.jpg", title: "Project 6", subtitle: "Web Design", link: "#" },
    { img: "/images/project-5.jpg", title: "Project 7", subtitle: "Web Design", link: "#" },
  ],
};

// Helper function for pattern-based layout
const getRowPattern = (rowIndex, rowLength) => {
  if (rowLength === 1) return ["col-12"];
  return rowIndex % 2 === 0
    ? ["col-md-4 col-12", "col-md-8 col-12"]
    : ["col-md-8 col-12", "col-md-4 col-12"];
};

function Projects() {
  const rowVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Split projects into rows of 2 projects each
  const rows = [];
  const projects = projectsData.projects;
  for (let i = 0; i < projects.length; i += 2) {
    rows.push(projects.slice(i, i + 2));
  }

  return (
    <section className="ftco-section ftco-project" id="projects-section">
      <div className="container">
        {/* Heading */}
        <motion.div
          className="row justify-content-center pb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={cardVariants}
        >
          <div className="col-md-12 heading-section text-center">
            <h1 className="big big-2">{projectsData.heading.title}</h1>
            <h2 className="mb-4">{projectsData.heading.subtitle}</h2>
            <p>{projectsData.heading.description}</p>
          </div>
        </motion.div>

        {/* Project Rows */}
        {rows.map((rowProjects, rowIndex) => {
          const pattern = getRowPattern(rowIndex, rowProjects.length);
          return (
            <motion.div
              className="row mb-4"
              key={rowIndex}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              variants={rowVariants}
            >
              {rowProjects.map((project, colIndex) => (
                <div className={pattern[colIndex]} key={project.title}>
                  <ProjectCard project={project} variants={cardVariants} />
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function ProjectCard({ project, variants }) {
  return (
    <motion.div
      className="project img d-flex justify-content-center align-items-center mb-4"
      style={{ backgroundImage: `url(${project.img})` }}
      variants={variants}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="text text-center p-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5 }}
      >
        <h3>
          <a href={project.link}>{project.title}</a>
        </h3>
        <span>{project.subtitle}</span>
      </motion.div>
    </motion.div>
  );
}

export default Projects;
