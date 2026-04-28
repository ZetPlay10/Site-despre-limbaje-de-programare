import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';      
import Login from './Login';
import Register from "./Register.jsx";
import AdminDashboard from './AdminDashboard';
import DetaliiLimbaj from './DetaliiLimbaj';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Componenta App
 * @description Componenta principala care gestioneaza rutele aplicatiei.
 * @component
 */

function App() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/detalii/:id" element={<DetaliiLimbaj />} />
    </Routes>
  );
}

export default App;