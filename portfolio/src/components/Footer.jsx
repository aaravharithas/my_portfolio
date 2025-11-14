function Footer(){
    return(
        <>
        <footer className="ftco-footer ftco-section">
  <div className="container">
    <div className="row mb-5">
      <div className="col-md">
        <div className="ftco-footer-widget mb-4">
          <h2 className="ftco-heading-2">About</h2>
          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts.
          </p>
          <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
            <li><a href="#"><span className="icon-twitter"></span></a></li>
            <li><a href="#"><span className="icon-facebook"></span></a></li>
            <li><a href="#"><span className="icon-instagram"></span></a></li>
          </ul>
        </div>
      </div>

      <div className="col-md">
        <div className="ftco-footer-widget mb-4">
          <h2 className="ftco-heading-2">Have a Questions?</h2>
          <div className="block-23 mb-3">
            <ul>
              <li>
                <span className="icon icon-map-marker"></span>
                <span className="text">Gurgaon, Haryana 122001</span>
              </li>
              <li>
                <a href="tel://+919321666720">
                  <span className="icon icon-phone"></span>
                  <span className="text">+91 9321 666 720</span>
                </a>
              </li>
              <li>
                <a href="mailto:aaravharithas@gmail.com">
                  <span className="icon icon-envelope"></span>
                  <span className="text">aaravharithas@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="row">
      <div className="col-md-12 text-center">
        <p>
          {/* Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. */}
          &copy; {new Date().getFullYear()} Shoutout to whose template I copied | made with{" "}
          <i className="icon-heart color-danger" aria-hidden="true"></i> by{" "}
          <a href="https://colorlib.com" target="_blank" rel="noopener noreferrer">
            Colorlib
          </a>
        </p>
      </div>
    </div>
  </div>
</footer>
</>
    )
}

export default Footer