import { motion } from "framer-motion";
import './Contact.css'; // Import the CSS file

// Data object for contact section
const contactData = {
  heading: {
    title: "Contact",
    subtitle: "Contact Me",
    description: "Feel free to contact me on these details",
  },
  items: [
    { icon: "icon-map-signs", title: "Address", text: "Gurgaon, Haryana 122001" },
    { icon: "icon-phone2", title: "Contact Number", text: "+91 9321 666 720", link: "tel://+919321666720" },
    { icon: "icon-paper-plane", title: "Email Address", text: "aaravharithas@gmail.com", link: "mailto:aaravharithas@gmail.com" },
    { icon: "icon-globe", title: "LinkedIn", text: "Gaurav Sharma", link: "https://www.linkedin.com/in/aaravharithas/" },
  ],
};

function Contact() {
  // Framer Motion variants
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const iconHover = {
  scale: 1.2,
  rotate: [0, 10, -10, 0],
  transition: { type: "tween", duration: 0.6, ease: "easeInOut" },
};


  return (
    <section className="ftco-section contact-section ftco-no-pb" id="contact-section">
      <div className="container">
        {/* Heading */}
        <motion.div
          className="row justify-content-center mb-5 pb-3"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="col-md-7 heading-section text-center">
            <h1 className="big big-2">{contactData.heading.title}</h1>
            <h2 className="mb-4">{contactData.heading.subtitle}</h2>
            <p>{contactData.heading.description}</p>
          </div>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          className="row d-flex contact-info mb-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
        >
          {contactData.items.map((item, idx) => (
            <motion.div className="col-md-6 col-lg-3 d-flex" variants={cardVariants} key={idx}>
              <div className="align-self-stretch box p-4 text-center hover-card">
                <motion.div
                  className="icon d-flex align-items-center justify-content-center"
                  whileHover={iconHover}
                >
                  <span className={item.icon}></span>
                </motion.div>
                <h3 className="mb-4">{item.title}</h3>
                {item.link ? (
                  <p>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">{item.text}</a>
                  </p>
                ) : (
                  <p>{item.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Contact;
