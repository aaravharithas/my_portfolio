import { motion } from "framer-motion";
import { FaTwitter, FaFacebookF, FaInstagram, FaHeart } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlinePhone } from "react-icons/hi";
import { GoLocation } from "react-icons/go";

// Footer data
const footerData = {
  about: {
    title: "About",
    description:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.",
    social: [
      { icon: FaTwitter, link: "https://twitter.com/" },
      { icon: FaFacebookF, link: "https://facebook.com/" },
      { icon: FaInstagram, link: "https://instagram.com/" },
    ],
  },
  contact: {
    title: "Have a Questions?",
    items: [
      { icon: GoLocation, text: "Gurgaon, Haryana 122001" },
      { icon: HiOutlinePhone, text: "+91 9321 666 720", link: "tel://+919321666720" },
      { icon: HiOutlineMail, text: "aaravharithas@gmail.com", link: "mailto:aaravharithas@gmail.com" },
    ],
  },
  copyright: {
    text: "Shoutout to whose template I copied | made with",
    author: "Colorlib",
    authorLink: "https://colorlib.com",
  },
};

function Footer() {
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.2 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const iconHover = {
    scale: 1.3,
    rotate: [0, 10, -10, 0],
    transition: { type: "spring", stiffness: 300 },
  };

  return (
    <motion.footer
      className="ftco-footer ftco-section py-5"
      style={{ backgroundColor: "#000", color: "#fff" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="row mb-3 justify-content-center text-center" variants={containerVariants}>
          
          {/* About Section */}
          <motion.div className="col-md-6 col-lg-6" variants={fadeInUp}>
            <div className="ftco-footer-widget mb-3">
              <h2 className="ftco-heading-2">{footerData.about.title}</h2>
              <p>{footerData.about.description}</p>
              <ul className="ftco-footer-social list-unstyled d-flex justify-content-center mt-3">
                {footerData.about.social.map((social, idx) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.li key={idx} whileHover={iconHover} className="ftco-animate mx-2">
                      <a href={social.link} target="_blank" rel="noopener noreferrer" aria-label="social-link">
                        <IconComponent size={24} color="#f5b700" />
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div className="col-md-6 col-lg-6" variants={fadeInUp}>
            <div className="ftco-footer-widget mb-3 text-center">
              <h2 className="ftco-heading-2">{footerData.contact.title}</h2>
              <div className="block-23 mb-3">
                <ul className="list-unstyled">
                  {footerData.contact.items.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <li className="d-flex justify-content-center align-items-center mb-2" key={idx}>
                        {item.link ? (
                          <a href={item.link} className="d-flex justify-content-center align-items-center">
                            <IconComponent size={20} color="#f5b700" className="me-2" />
                            <span className="text">{item.text}</span>
                          </a>
                        ) : (
                          <div className="d-flex justify-content-center align-items-center">
                            <IconComponent size={20} color="#f5b700" className="me-2" />
                            <span className="text">{item.text}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Footer Bottom */}
        <motion.div className="row" variants={fadeInUp}>
          <div className="col-md-12 text-center">
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} {footerData.copyright.text}{" "}
              <FaHeart size={16} color="#f5b700" style={{ verticalAlign: "middle" }} /> by{" "}
              <a href={footerData.copyright.authorLink} target="_blank" rel="noopener noreferrer">
                {footerData.copyright.author}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;
