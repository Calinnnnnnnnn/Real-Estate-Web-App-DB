import React, { useState } from "react";
import './Content.scss'
import { useNavigate } from 'react-router-dom';

const types = ["apartamente", "case", "spatii comerciale"];

function Content() {
    const navigate = useNavigate();
    const [query, setQuery] = useState({
        type: "apartamente",
        location: "",
    });

    const switchType = (val) => {
        setQuery((prev) => ({ ...prev, type: val }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const { type, location } = query;
    
        // Navigăm către pagina ListPage cu parametrii incluși
        const queryParams = new URLSearchParams({
            type,
            location: location || "", // Dacă locația este necompletată, trimitem un șir gol
        });
    
        navigate(`/listpage?${queryParams.toString()}`);
    };

    return (
        <div className="wrapper-content">
            <div className="textContainer">
                <div className="wrapper-textContainer">
                    <h1 className="title">
                        Găsește cea mai bună locuință pentru tine și familia ta
                    </h1>
                    <p>
                        Fie că ești în căutarea unei locuințe, vrei să închiriezi un
                        apartament sau să vinzi o proprietate, aici vei găsi toate
                        opțiunile de care ai nevoie. Cu filtre avansate și informații
                        detaliate despre fiecare anunț, îți punem la dispoziție toate
                        instrumentele necesare pentru a lua decizia potrivită.
                    </p>
                    <div className="searchbar">
                        <div className="type">
                            {types.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => switchType(type)}
                                    className={query.type === type ? "active" : ""}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                name="location"
                                placeholder="Oraş"
                                value={query.location}
                                onChange={(e) => setQuery({ ...query, location: e.target.value })}
                            />
                            
                            <button type="submit">
                                <img src="/search.png" alt="" />
                            </button>
                        </form>
                    </div>

                    <div className="boxes">
                        <div className="box">
                            <h1>16+</h1>
                            <h2>Ani de experiență</h2>
                        </div>
                        <div className="box">
                            <h1>200</h1>
                            <h2>Agenți profesioniști</h2>
                        </div>
                        <div className="box">
                            <h1>1200+</h1>
                            <h2>Locuințe înregistrate</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className="imgContainer">
                <img src="/bg.png" alt="" />
            </div>
        </div>
    );
}

export default Content;