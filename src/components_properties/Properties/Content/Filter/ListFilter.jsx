import React, { useState, useEffect } from "react";
import './ListFilter.scss';
import { useSearchParams } from "react-router-dom";

function ListFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        location: searchParams.get("location") || "",
        status: searchParams.get("status") || "", // Corectăm denumirea pentru "cumparare/inchiriere"
        property: searchParams.get("property") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedroom: searchParams.get("bedroom") || "",
    });

    // Sincronizăm filtrele cu URL-ul atunci când searchParams se schimbă
    useEffect(() => {
        setFilters({
            location: searchParams.get("location") || "",
            status: searchParams.get("status") || "",
            property: searchParams.get("property") || "",
            minPrice: searchParams.get("minPrice") || "",
            maxPrice: searchParams.get("maxPrice") || "",
            bedroom: searchParams.get("bedroom") || "",
        });
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newParams = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                newParams[key] = filters[key];
            }
        });
        setSearchParams(newParams);
    };

    return (
        <form className="ListFilter" onSubmit={handleSubmit}>
            <h1>
                Rezultate pentru <b>{filters.location ? filters.location : "toate orașele"}</b>
            </h1>
            <div className="top">
                <div className="item">
                    <label htmlFor="location">Locație</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="Oraș"
                        value={filters.location}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="bottom">
                <div className="item">
                    <label htmlFor="status">Tip</label>
                    <select name="status" id="status" value={filters.status} onChange={handleChange}>
                        <option value="">Orice</option>
                        <option value="cumparare">Cumpărare</option>
                        <option value="inchiriere">Închiriere</option>
                    </select>
                </div>
                <div className="item">
                    <label htmlFor="property">Categorie</label>
                    <select name="property" id="property" value={filters.property} onChange={handleChange}>
                        <option value="">Oricare</option>
                        <option value="1">Apartamente</option>
                        <option value="2">Case</option>
                        <option value="3">Terenuri</option>
                        <option value="4">Spații comerciale</option>
                        <option value="5">Garaje</option>
                    </select>
                </div>
                <div className="item">
                    <label htmlFor="minPrice">Preț minim</label>
                    <input
                        type="number"
                        id="minPrice"
                        name="minPrice"
                        placeholder="Orice"
                        value={filters.minPrice}
                        onChange={handleChange}
                    />
                </div>
                <div className="item">
                    <label htmlFor="maxPrice">Preț maxim</label>
                    <input
                        type="number"
                        id="maxPrice"
                        name="maxPrice"
                        placeholder="Orice"
                        value={filters.maxPrice}
                        onChange={handleChange}
                    />
                </div>
                <div className="item">
                    <label htmlFor="bedroom">Camere</label>
                    <input
                        type="number"
                        id="bedroom"
                        name="bedroom"
                        placeholder="Orice"
                        value={filters.bedroom}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">
                    <img src="/search.png" alt="Search" />
                </button>
            </div>
        </form>
    );
}

export default ListFilter;