import React from "react";
import './Map_prop.scss';
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

function Map_prop({ items }) {
    const center = items.length > 0 
        ? [items[0].lat || 45.9432, items[0].lon || 24.9668] // Centrul este setat pe prima proprietate sau fallback pe centrul României
        : [45.9432, 24.9668];

    return (
        <MapContainer
            center={center}
            zoom={7}
            scrollWheelZoom={false}
            className="map"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {items.map((item) => (
                <Pin key={item.id} item={item} />
            ))}
        </MapContainer>
    );
}

export default Map_prop;