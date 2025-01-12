import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const [tipUtilizator, setTipUtilizator] = useState(null); // Stocăm tipul utilizatorului
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchTipUtilizator = async () => {
            if (isAuthenticated && userEmail) {
                try {
                    const response = await fetch(`http://localhost:3000/user/type?email=${encodeURIComponent(userEmail)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setTipUtilizator(data.tip_utilizator); // Salvăm tipul utilizatorului
                    } else {
                        console.error('Eroare la obținerea tipului utilizatorului.');
                    }
                } catch (error) {
                    console.error('Eroare de rețea:', error);
                }
            }
        };

        fetchTipUtilizator();
    }, [isAuthenticated, userEmail]);

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        const confirmLogout = window.confirm("Ești sigur că vrei să te deloghezi?");
        if (confirmLogout) {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            setTipUtilizator(null); // Resetăm tipul utilizatorului
            navigate('/');
        }
    };

    const handlePropertiesClick = () => {
        if (isAuthenticated) {
            navigate('/properties');
        } else {
            alert("Trebuie să fii logat pentru a accesa pagina Proprietăți.");
        }
    };

    const handleAdminPageClick = () => {
        navigate('/admin'); // Navighează către pagina Admin
    };

    return (
        <section className='h-wrapper'>
            <div className='flexCenter paddings innerWidth h-container'>
                <img src="./logo.png" alt="logo" width={100} />

                <div className='flexCenter h-menu'>
                    <a href="#" onClick={handlePropertiesClick}>Proprietăți</a>

                    {!isAuthenticated ? (
                        <>
                            <a href="#" onClick={() => navigate('/login')}>Log In</a>
                            <a href="#" onClick={() => navigate('/signup')} className="register">Sign Up</a>
                        </>
                    ) : (
                        <div className="user-info">
                            <FaUserCircle
                                className="user-icon"
                                onClick={handleProfileClick}
                                title="Profilul utilizatorului"
                                style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '0.5rem' }}
                            />
                            <span>{userEmail}</span>

                            {tipUtilizator === 'Admin' && ( // Afișăm linkul către Admin Page doar pentru admini
                                <button onClick={handleAdminPageClick} className="button admin-button">
                                    Admin Page
                                </button>
                            )}

                            <button onClick={handleLogout} className="button">Logout</button>
                        </div>
                    )}

                    <button className='button'>
                        <a href="mailto:homyz@gmail.com">Contact</a>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Header;