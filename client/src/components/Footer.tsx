import FacebookIcon from "../assets/web-images/Facebook.png";
import InstagramIcon from "../assets/web-images/Instagram.png";
import TiktokIcon from "../assets/web-images/Tiktok.png";

const Footer = () => {
  return (
    <section className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          <h1>KOOGLE ARDEN</h1>
          <div className="footer-follow-us">
            <p className="footer-heading">Follow Us</p>
            <div className="footer-social-icons">
              <a
                href="https://www.tiktok.com/@koogle.arden?_t=8r8d8iT1Vic&_r=1"
                className="footer-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on TikTok"
              >
                <img src={TiktokIcon} alt="TikTok" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61566741720191&mibextid=LQQJ4d"
                className="footer-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <img src={FacebookIcon} alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com/kooglearden.7?igsh=bzZybHJqNmtyMTZ2"
                className="footer-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                <img src={InstagramIcon} alt="Instagram" />
              </a>
            </div>
          </div>
          <div className="footer-location">
            <p className="footer-location-heading">Our Location:</p>
            <a
              href="https://www.google.com/maps/place/Koogle+Arden,+Fazal+Centre,+Green+Town,+Gujranwala,+Punjab,+Pakistan/@32.2397674,74.1617157,16z/data=!4m6!3m5!1s0x391f29004890d515:0xb608796b564bd304!8m2!3d32.2397674!4d74.1617157!16s%2Fg%2F11wc5sstd3"
              className="footer-address"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our location on Google Maps"
            >
              Koogle Arden Retail Store, Shop No #8 Fazal Centre, Gujranwala
            </a>
          </div>
          <div className="footer-email">
            <p>Our Email:</p>
            <p className="footer-email-address">kooglearden@gmail.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
