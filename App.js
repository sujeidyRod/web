import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Header from './Header';
import Frutas from './Frutas';
import Verduras from './Verduras';
import Cereales from './Cereales';
import Lacteos from './Lacteos';
import Botanas from './Botanas';
import Bebidas from './Bebidas';
import Carnes from './Carnes';
import Enlatados from './Enlatados';
import HigieneBelleza from './HigieneBelleza';
import LimpiezaJarcieria from './LimpiezaJarcieria';
import HarinaPan from './HarinaPan';
import Abarrotes from './Abarrotes';
import Login from './Login';
import CrearPromocion from './CrearPromocion';
import './App.css';
import CrearUsuario from './CrearUsuario';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isLoggedIn');
    if (isAuthenticated === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username) => {
    console.log('Inicio de sesión exitoso para:', username);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path="/frutas" element={<Frutas />} />
          <Route path="/verduras" element={<Verduras />} />
          <Route path="/cereales" element={<Cereales />} />
          <Route path="/lacteos" element={<Lacteos />} />
          <Route path="/botanas" element={<Botanas />} />
          <Route path="/bebidas" element={<Bebidas />} />
          <Route path="/carnes" element={<Carnes />} />
          <Route path="/higienebelleza" element={<HigieneBelleza />} />
          <Route path="/limpiezajarcieria" element={<LimpiezaJarcieria />} />
          <Route path="/harinapan" element={<HarinaPan />} />
          <Route path="/enlatados" element={<Enlatados />} />
          <Route path="/abarrotes" element={<Abarrotes />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/crear-promocion" element={isLoggedIn ? <CrearPromocion onClose={() => {}} isLoggedIn={isLoggedIn} /> : <Navigate to="/login" />} />
          <Route path="/crear-usuario" element={isLoggedIn ? <CrearUsuario onClose={() => {}} isLoggedIn={isLoggedIn} /> : <Navigate to="/login" />} />
        </Routes>
      
           
          </div>
        
      
    </Router>
  );
};

export default App;


