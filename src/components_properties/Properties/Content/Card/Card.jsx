import React from "react";
import './Card.scss';
import { Link } from "react-router-dom";

function Card({ item }) {
    return (
        <div className="card">
            {/* Link către pagina detaliată */}
            <Link to={`/property/${item.id}`} className="imageContainer">
                <img src={item.img || '/placeholder.png'} alt={item.title} />
            </Link>
            <div className="textContainer">
                <h2 className="title">
                    {/* Link către pagina detaliată în titlu */}
                    <Link to={`/property/${item.id}`}>{item.title}</Link>
                </h2>
                <p className="address">
                    <img src="/pin.png" alt="location" />
                    <span>{item.address}</span>
                </p>
                <p className="price">$ {item.price}</p>
                <div className="bottom">
                    <div className="features">
                        <div className="feature">
                            <img src="/bed.png" alt="bedroom" />
                            <span>{item.bedroom} camere</span>
                        </div>
                        <div className="feature">
                            <img src="/size.png" alt="surface" />
                            <span>{item.surface} m²</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;