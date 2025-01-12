import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components_homepage/Header/Header";
import Hero from "./components_homepage/Hero/Hero";
import './App.css'
import Companies from "./components_homepage/Companies/Companies";
import Residencies from "./components_homepage/Residencies/Residencies";
import Value from "./components_homepage/Value/Value";
import Contact from "./components_homepage/Contact/Contact";
import Footer from "./components_homepage/Footer/Footer";
import GetStarted from "./components_homepage/GetStarted/GetStarted";
import LoginForm from "./components_loginpage/LoginForm/LoginForm";
import SingupForm from "./components_loginpage/SignupForm/SignupForm";
import Navbar from "./components_properties/Properties/Navbar/Navbar";
import Content from "./components_properties/Properties/Content/Content";
import ListPage from "./components_properties/Properties/ListPage/ListPage";
import Profile from "./components_user_profile/Profile";
import SinglePage from "./components_properties/Properties/SinglePage/singlePage";
import Admin from "./components_adminpage/Admin";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta pentru pagina principală (HOME) */}
          <Route path="/" element={
            <div className="App home-page">
              {/* Continutul paginii HOME */}
              <div>
                <div className="white-gradient" />
                <Header />
                <Hero />
              </div>
              <Companies />
              <Residencies />
              <Value />
              <Contact />
              <GetStarted />
              <Footer />
            </div>
          } />
          
          {/* Ruta pentru pagina de login */}
          <Route path="/login" element={<LoginForm />} />
          {/* Ruta pentru pagina de signup */}
          <Route path='/signup' element={<SingupForm />}  />
          {/* Ruta pentru pagina de prezentare proprietati */}
          <Route path='/properties' element={
            <div className="App properties-page">
              {/* Continutul paginii de proprietati */}
              <div>
                <div className="layout-properties">
                  <Navbar />
                  <Content />
                </div>
              </div>
            </div>
          } />
          {/* Ruta pentru pagina de listare a proprietatilor */}
          <Route path = '/listpage' element = {
            <div className="App_listpage" >
              <div>
                <div className="layout-navbar">
                  <Navbar />
                </div>
                <div className="layout-listpage">
                  <ListPage />
                </div>
              </div>
            </div>
          } />
          <Route path = '/profile' element={<Profile />} />
          <Route path = "/property/:id" element={<SinglePage />} />
          <Route path = "/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
