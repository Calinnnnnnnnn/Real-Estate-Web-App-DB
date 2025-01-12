import React, {useState} from "react";
import "./LoginForm.css";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import {motion} from 'framer-motion'
import { useNavigate } from 'react-router-dom';



const LoginForm = () => {
    const [usernameActive, setUsernameActive] = useState(false);
    const [passwordActive, setPasswordActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginData = {
            email: username,
            parola: password
        };

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('isAuthenticated', 'true'); //Pentru a retine ca utilizatorul este autentificat
            localStorage.setItem('userEmail', username); //Retinem adresa lui de mail

            alert(data.message); // Afișează mesajul de succes
            navigate('/properties'); // Redirecționează utilizatorul
        } else {
            alert('Eroare: ' + data.error); // Afișează mesajul de eroare
        }

    }


    return (
    
        <div className="container-login">
            <img src = "src/components_loginpage/Assets/background_login.jpg" alt = "" />

            <motion.div 
            initial={{y: "2rem", opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 1.5, type: "spring"}}
            className="wrapper">
                <form onSubmit = {handleSubmit}>
                    <h1 className="login-h1">Login</h1>
                    <div className="input-box">
                        <label className={usernameActive ? 'active' : ''}>Username</label>
                        <input 
                            type="text"
                            value = {username}
                            onChange = {(e) => setUsername(e.target.value)} 
                            required 
                            onFocus={() => setUsernameActive(true)} 
                            onBlur={(e) => setUsernameActive(e.target.value !== '')} 
                        />
                        <FaUser className="icon-user"/>
                    </div>

                    <div className="input-box">
                        <label className={passwordActive ? 'active' : ''}>Parola</label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            value = {password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            onFocus={() => setPasswordActive(true)} 
                            onBlur={(e) => setPasswordActive(e.target.value !== '')} 
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="toggle-password">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="remember-forgot">
                        <label><input type = 'checkbox' />Ține-mă minte</label>
                        <a href="" onClick={() => navigate('/forgetpassword')}>Ai uitat parola?</a>
                    </div>
                    <button className = "button-login" type="submit">Sign in</button>
                    <div className="register-link">
                        <p>Nu aveți cont? <a href="" onClick={() => navigate('/signup')}>Sign up aici</a></p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginForm;
