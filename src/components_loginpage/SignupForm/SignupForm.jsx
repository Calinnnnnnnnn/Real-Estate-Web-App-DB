import React, { useState, useEffect } from "react";
import './SignupForm.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Adăugăm importul pentru useNavigate

const TextAnimator = ({ phrases, typingSpeed }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        const isEndOfPhrase = displayedText.length === currentPhrase.length;

        let timer;

        if (isDeleting) {
            timer = setTimeout(() => {
                setDisplayedText(currentPhrase.substring(0, displayedText.length - 1));
                if (displayedText === '') {
                    setIsDeleting(false);
                    setPhraseIndex((phraseIndex + 1) % phrases.length); // Trecerea la următoarea propoziție
                }
            }, typingSpeed / 2);
        } else {
            timer = setTimeout(() => {
                setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
                if (isEndOfPhrase) {
                    setIsDeleting(true);
                }
            }, typingSpeed);
        }

        return () => clearTimeout(timer); // Curăță timeout-ul la fiecare actualizare
    }, [displayedText, isDeleting, phrases, phraseIndex, typingSpeed]);

    return <h2 className='animated-text'>{displayedText}</h2>;
};

const SignupForm = () => {
    const [nume, setNume] = useState('');
    const [prenume, setPrenume] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isPasswordMatch, setIsPasswordMatch] = useState(true);
    const [userType, setUserType] = useState('Client'); // Setează implicit client

    const phrases = [
        "Bine ai venit!",
        "Alătură-te comunității noastre!",
        "Ia parte la această poveste!"
    ];
    const typingSpeed = 200; // Viteza de tiparire în milisecunde

    const navigate = useNavigate(); // Folosim useNavigate pentru redirecționare

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const isValid = /^(?=.*\d)(?=.*[A-Z]).{8,}$/.test(value);
        setIsPasswordValid(isValid);
        setIsPasswordMatch(value === confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setIsPasswordMatch(value === password);
    };

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Previne comportamentul implicit de trimitere a formularului

        const userData = {
            nume,
            prenume,
            email,
            telefon,
            parola: password,
            tip_utilizator: userType,
            data_inregistrare: new Date().toISOString(),
        };

        // Trimite datele la server
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);

            alert(data.message); // Afișează mesajul de succes
            navigate('/properties'); // Redirecționează utilizatorul către pagina de proprietăți
        } else {
            alert('Eroare: ' + data.error); // Afișează mesajul de eroare
        }
    };

    return (
        <div className="signup-container">
            <motion.div
                initial={{ y: "2rem", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, type: "spring" }}
                className="form-container">
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nume</label>
                        <input 
                            type="text" 
                            value={nume}
                            onChange={(e) => setNume(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Prenume</label>
                        <input 
                            type="text" 
                            value={prenume}
                            onChange={(e) => setPrenume(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Tipul de utilizator</label>
                        <div className="radio-group">
                            <label>
                                <input 
                                    type="radio" 
                                    value="Client" 
                                    checked={userType === 'Client'} 
                                    onChange={handleUserTypeChange}
                                    required
                                /> 
                                Client
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    value="Admin" 
                                    checked={userType === 'Admin'} 
                                    onChange={handleUserTypeChange}
                                    required
                                /> 
                                Admin
                            </label>
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Număr de telefon (opțional)</label>
                        <input 
                            type="tel" 
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)} 
                        />
                    </div>
                    <div className="input-group">
                        <label>Parola</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={handlePasswordChange}
                            required 
                        />
                        {!isPasswordValid && (
                            <p className="error">Parola trebuie să aibă cel puțin 8 caractere, o literă mare și un număr.</p>
                        )}
                    </div>
                    <div className="input-group">
                        <label>Confirmare Parola</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required 
                        />
                        {!isPasswordMatch && (
                            <p className='error'>Parolele nu se potrivesc.</p>
                        )}
                    </div>
                    <button type="submit" className="button-submit-signup">Sign Up</button>
                </form>
            </motion.div>
            <img src="src/components_loginpage/Assets/background_signup2.jpg" alt="" />
            <div className="animated-text">
                <TextAnimator phrases={phrases} typingSpeed={typingSpeed} />
            </div>
        </div>
    );
};

export default SignupForm;
