function Projects(){
    return(
        <>
        <section className="ftco-section ftco-project" id="projects-section">
  <div className="container">
    <div className="row justify-content-center pb-5">
      <div className="col-md-12 heading-section text-center">
        <h1 className="big big-2">Projects</h1>
        <h2 className="mb-4">Our Projects</h2>
        <p>
          Here you will find some of the personal projects that I created with
          each project containing its own case study
        </p>
      </div>
    </div>

    <div className="row">
      {/* First Row */}
      <div className="col-md-4">
        <div
          className="project img d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url(/images/project-4.jpg)" }}
        >
          <div className="overlay"></div>
          <div className="text text-center p-4">
            <h3>
              <a href="single.html">Branding &amp; Illustration Design</a>
            </h3>
            <span>Web Design</span>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div
          className="project img d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url(/images/project-5.jpg)" }}
        >
          <div className="overlay"></div>
          <div className="text text-center p-4">
            <h3>
              <a href="single.html">Branding &amp; Illustration Design</a>
            </h3>
            <span>Web Design</span>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="col-md-8">
        <div
          className="project img d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url(/images/project-1.jpg)" }}
        >
          <div className="overlay"></div>
          <div className="text text-center p-4">
            <h3>
              <a href="single.html">Branding &amp; Illustration Design</a>
            </h3>
            <span>Web Design</span>
          </div>
        </div>

        <div
          className="project img d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url(/images/project-6.jpg)" }}
        >
          <div className="overlay"></div>
          <div className="text text-center p-4">
            <h3>
              <a href="#">Branding &amp; Illustration Design</a>
            </h3>
            <span>Web Design</span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-md-4">
        <div className="row">
          <div className="col-md-12">
            <div
              className="project img d-flex justify-content-center align-items-center"
              style={{ backgroundImage: "url(images/project-2.jpg)" }}
            >
              <div className="overlay"></div>
              <div className="text text-center p-4">
                <h3>
                  <a href="#">Branding &amp; Illustration Design</a>
                </h3>
                <span>Web Design</span>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div
              className="project img d-flex justify-content-center align-items-center"
              style={{ backgroundImage: "url(images/project-3.jpg)" }}
            >
              <div className="overlay"></div>
              <div className="text text-center p-4">
                <h3>
                  <a href="#">Branding &amp; Illustration Design</a>
                </h3>
                <span>Web Design</span>
              </div>
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

export default Projects