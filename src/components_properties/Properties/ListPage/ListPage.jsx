import React, { useEffect, useState } from "react";
import './ListPage.scss';
import { useSearchParams } from "react-router-dom";
import ListFilter from "../Content/Filter/ListFilter";
import Card from "../Content/Card/Card";
import Map_prop from "../Content/Map_properties/Map_prop";

function ListPage() {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchProperties = async () => {
            // Extragem filtrele din URL
            const params = {
                location: searchParams.get("location") || "",
                type: searchParams.get("type") || "", // Gestionăm tipul proprietății
                property: searchParams.get("property") || "",
                minPrice: searchParams.get("minPrice") || "",
                maxPrice: searchParams.get("maxPrice") || "",
                bedroom: searchParams.get("bedroom") || "",
                status: searchParams.get("status") || "", // Adăugăm filtrul pentru status

            };
    
            console.log("Filters from URL:", params); // Debugging
    
            const query = new URLSearchParams(
                Object.entries(params).filter(([_, value]) => value) // Include doar parametrii cu valoare
            ).toString();
    
            const url = `http://localhost:3000/properties?${query}`;
    
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched properties:", data); // Debugging
                    setProperties(data);
                } else {
                    console.error("Failed to fetch properties");
                }
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchProperties();
    }, [searchParams]);

    if (isLoading) {
        return <div className="loading">Se încarcă proprietățile...</div>;
    }

    return (
        <div className="listPage">
            <div className="listContainer">
                <div className="listContainer-wrapper">
                    <ListFilter />
                    {properties.length === 0 ? (
                        <div className="no-properties-message">
                            <h2>Nu există proprietăți disponibile pentru această căutare.</h2>
                            <p>Te rugăm să încerci alt oraș sau alt tip de proprietate.</p>
                        </div>
                    ) : (
                        properties.map((item) => (
                            <Card key={item.id} item={item} />
                        ))
                    )}
                </div>
            </div>
            <div className="mapContainer">
                <Map_prop items={properties} />
            </div>
        </div>
    );
}

export default ListPage;