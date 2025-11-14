function Hero() {
    return (
        <>
{/* HERO + ABOUT SECTION */}
<section
  id="home-about-section"
  className="hero ftco-about img ftco-section ftco-no-pb"
  style={{ paddingTop: "120px" }}   // FIX FOR NAV OVERLAP
>
  <div className="container">

    <div className="row d-flex align-items-center justify-content-between">

      {/* LEFT COLUMN (HERO TEXT) */}
      <div className="col-md-6">
        <div className="text" style={{ color: "#fff", fontFamily: "Poppins, sans-serif" }}>
          
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
            Hello!
          </span>

          <h1
            className="mb-4 mt-3"
            style={{
              fontSize: "64px",
              fontWeight: "800",
              lineHeight: "1.1",
              margin: "15px 0",
            }}
          >
            I'm <span style={{ color: "#f5b700" }}>Gaurav<br />Sharma</span>
          </h1>

          <h2 className="mb-4">A Fullstack Backend Developer</h2>

          <p style={{ marginTop: "30px" }}>
            <a
              href="#"
              className="btn btn-primary py-3 px-4"
              style={{
                backgroundColor: "#f5b700",
                color: "#000",
                fontWeight: 600,
                borderRadius: "50px",
                border: "none",
              }}
            >
              Hire me
            </a>

            <a
              href="#"
              className="btn btn-white btn-outline-white py-3 px-4"
              style={{
                backgroundColor: "transparent",
                color: "#fff",
                fontWeight: 600,
                border: "2px solid #fff",
                borderRadius: "50px",
                marginLeft: "10px",
              }}
            >
              My works
            </a>
          </p>

        </div>
      </div>

      {/* RIGHT COLUMN (ABOUT SECTION) */}
      <div className="col-md-6 col-lg-6 pl-lg-5 pb-5">
        <div className="overlay"></div>

        <div className="heading-section">
          <h1 className="big">About</h1>
          <h2 className="mb-4">About Me</h2>

          <p>
            Always learning, always building — because great software starts with
            curiosity and persistence.
          </p>

          <ul className="about-info mt-4 px-md-0 px-2">
            <li className="d-flex"><span>Name:</span> <span>Gaurav Sharma</span></li>
            <li className="d-flex"><span>Date of birth:</span> <span>August 11, 2002</span></li>
            <li className="d-flex"><span>Address:</span> <span>Gurgaon, Haryana</span></li>
            <li className="d-flex"><span>Zip code:</span> <span>122001</span></li>
            <li className="d-flex"><span>Email:</span> <span>aaravharithas@gmail.com</span></li>
            <li className="d-flex"><span>Phone:</span> <span>+91-9321-666-720</span></li>
          </ul>

          <div className="counter-wrap d-flex mt-md-3">
            <div className="text">
              <p><a href="#" className="btn btn-primary py-3 px-3">Download CV</a></p>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</section>

        </>
    )
}

export default Hero