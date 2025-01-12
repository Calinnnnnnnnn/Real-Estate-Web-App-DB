import React from "react";
import './Navbar.css'
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";

const Navbar = () =>{
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        // Întreabă utilizatorul dacă este sigur că vrea să se delogheze
        const confirmLogout = window.confirm("Ești sigur că vrei să te deloghezi?");
        
        if (confirmLogout) {
            // Șterge datele de autentificare din localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            // Navighează utilizatorul la pagina de home
            navigate('/');
        }
    };
    
    return(
        <nav >
            <div className="left">
                <a href = "/" className="logo">
                    <img src = "/logo3.png" alt = "" />
                    <span>Homyz</span>
                </a>
                <div className="go-home">
                    <img src = "/home.png" alt = "home" />
                    <a href = '/'>Home</a>
                </div>
                <a href ="mailto:homyz@gmail.com">Contact</a>
                <a href = '/listpage'>Listare Proprietati</a>
            </div>
            <div className="right">
                {!isAuthenticated ? (
                    <>
                        <a href="" onClick={() => navigate('/login')}>Sign in</a>
                        <a href="" onClick={() => navigate('/signup')} className="register">Sign up</a>
                    </>
                ) : (
                    <div className="user_administrate">
                        <div className="user-info">
                            <FaUserCircle
                                className="user-icon"
                                onClick={handleProfileClick}
                                title="Profilul utilizatorului"
                                style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '0.5rem' }}
                            />
                            <span>{userEmail}</span>
                            <button
                                className="logout-button" 
                                onClick={handleLogout}
                                title="Deloghează-te"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar;
