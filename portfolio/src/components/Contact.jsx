function Contact(){
    return (
        <>
        <section className="ftco-section contact-section ftco-no-pb" id="contact-section">
  <div className="container">
    <div className="row justify-content-center mb-5 pb-3">
      <div className="col-md-7 heading-section text-center">
        <h1 className="big big-2">Contact</h1>
        <h2 className="mb-4">Contact Me</h2>
        <p>Feel free to contact me on these details</p>
      </div>
    </div>

    <div className="row d-flex contact-info mb-5">

      <div className="col-md-6 col-lg-3 d-flex">
        <div className="align-self-stretch box p-4 text-center">
          <div className="icon d-flex align-items-center justify-content-center">
            <span className="icon-map-signs"></span>
          </div>
          <h3 className="mb-4">Address</h3>
          <p>Gurgaon, Haryana 122001</p>
        </div>
      </div>

      <div className="col-md-6 col-lg-3 d-flex">
        <div className="align-self-stretch box p-4 text-center">
          <div className="icon d-flex align-items-center justify-content-center">
            <span className="icon-phone2"></span>
          </div>
          <h3 className="mb-4">Contact Number</h3>
          <p>
            <a href="tel://1234567920">+91 9321 666 720</a>
          </p>
        </div>
      </div>

      <div className="col-md-6 col-lg-3 d-flex">
        <div className="align-self-stretch box p-4 text-center">
          <div className="icon d-flex align-items-center justify-content-center">
            <span className="icon-paper-plane"></span>
          </div>
          <h3 className="mb-4">Email Address</h3>
          <p>
            <a href="mailto:aaravharithas@gmail.com">aaravharithas@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="col-md-6 col-lg-3 d-flex">
        <div className="align-self-stretch box p-4 text-center">
          <div className="icon d-flex align-items-center justify-content-center">
            <span className="icon-globe"></span>
          </div>
          <h3 className="mb-4">Website</h3>
          <p>
            <a href="#">myportfoliohub.pythonanywhere.com</a>
          </p>
        </div>
      </div>

    </div>
  </div>
</section>
</>
    )
}

export default Contact