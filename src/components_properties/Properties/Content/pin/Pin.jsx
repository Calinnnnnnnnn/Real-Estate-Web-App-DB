import React from "react";
import './pin.scss';
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";

function Pin({ item }) {
    if (!item.lat || !item.lon) return null; // Verificare suplimentară pentru coordonate valide

    return (
        <Marker position={[item.lat, item.lon]}>
            <Popup>
                <div className="popupContainer">
                    <img src={item.img} alt={item.title} />
                    <div className="text_Container">
                        <Link to={`/${item.id}`}>{item.title}</Link>
                        <span>{item.bedroom} camere</span>
                        <b>$ {item.price}</b>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export default Pin;