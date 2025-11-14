import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { href: "#home-about-section", label: "Home" },
    { href: "#resume-section", label: "Resume" },
    { href: "#skills-section", label: "Skills" },
    { href: "#projects-section", label: "Projects" },
    { href: "#contact-section", label: "Contact" },
    { href: "mlform.html", label: "Ml algorithm" },
  ];

  const desktopItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
    hover: { scale: 1.1, color: "#f5b700", transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 300 },
    }),
    hover: { scale: 1.1, color: "#f5b700", transition: { duration: 0.2 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.4, ease: "easeIn" } },
  };

  return (
    <motion.nav
      className="navbar navbar-expand-lg navbar-dark ftco_navbar ftco-navbar-light site-navbar-target"
      id="ftco-navbar"
      style={{ zIndex: 9999 }}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container">
        {/* Navbar Brand */}
        <motion.a
          className="navbar-brand"
          href="./index.html"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.1, color: "#f5b700" }}
        >
          Gaurav
        </motion.a>

        {/* Hamburger Button */}
        <button
          className="navbar-toggler js-fh5co-nav-toggle fh5co-nav-toggle"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="oi oi-menu"></span> Menu
        </button>

        {/* Desktop Menu */}
        <ul className="navbar-nav nav ml-auto d-none d-lg-flex">
          {menuItems.map((item, index) => (
            <motion.li
              className="nav-item"
              key={index}
              custom={index}
              variants={desktopItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              whileHover="hover"
            >
              <a href={item.href} className="nav-link">
                <span>{item.label}</span>
              </a>
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="navbar-collapse d-lg-none position-absolute bg-dark w-100"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
              style={{ top: "56px", left: 0, padding: "1rem", zIndex: 9999 }}
            >
              <ul className="navbar-nav nav flex-column text-center">
                {menuItems.map((item, index) => (
                  <motion.li
                    className="nav-item mb-3"
                    key={index}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    whileHover="hover"
                  >
                    <a
                      href={item.href}
                      className="nav-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

export default Navbar;
