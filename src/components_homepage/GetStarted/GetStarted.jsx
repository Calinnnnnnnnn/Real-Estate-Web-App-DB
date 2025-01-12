import React from "react";
import "./GetStarted.css";
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();
  return (
    <div id="get-started" className="g-wrapper">
      <div className="paddings innerWidth g-container">
        <div className="flexColCenter inner-container">
          <span className="primaryText">Începe să fii un membru Homyz</span>
          <span className="secondaryText">
            În cazul în care nu ești deja membru, creează un cont gratuit chiar acum!
            Găsește rapid locuința visurilor tale!
          </span>
          <button className="button" href>
            <a href="" onClick={() => navigate('/signup')}>Get Started</a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;