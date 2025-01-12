import React from "react";
import "./Footer.css";
const Footer = () => {
  return (
    <div className="f-wrapper">
      <div className="paddings innerWidth flexCenter f-container">
        {/* left side */}
        <div className="flexColStart f-left">
          <img src="./logo2.png" alt="" width={120} />
          <span className="secondaryText">
          Tot conținutul acestui site, inclusiv texte, imagini,
          grafica, <br /> logo-uri și design, sunt protejate prin drepturi de autor și legislația privind mărcile înregistrate. <br />
          Este interzisă utilizarea, reproducerea sau distribuirea acestor materiale fără acordul scris prealabil al titularului drepturilor.
          </span>
        </div>

        <div className="flexColStart f-right">
          <span className="primaryText">Trusted Real-Estate Brand</span>
          <span className="secondaryText">145 New York, FL 5467, USA</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;