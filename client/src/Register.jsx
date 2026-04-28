import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Componenta Register
 * @description Gestioneaza inregistrarea utilizatorilor noi in aplicatie.
 * Colecteaza datele (nume, email, parola) si le trimite catre server pentru creare cont.
 */
function Register() {
    const navigate = useNavigate();

    const [nume, setNume] = useState("");
    const [email, setEmail] = useState("");
    const [parola, setParola] = useState("");

    /**
     * Gestioneaza trimiterea formularului de inregistrare.
     * @param {Event} e - Evenimentul de submit.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        const dateRegister = {
            nume: nume,
            email: email,
            parola: parola
        };

        axios.post('http://127.0.0.1:8081/auth/register', dateRegister)
            .then(raspuns => {
                alert("Cont creat cu succes! Acum te poti loga.");
                navigate("/login");
            })
            .catch(err => {
                if (err.response) {
                    alert(err.response.data.message || "Eroare la inregistrare.");
                } else {
                    console.error("Eroare:", err);
                    alert("Nu s-a putut contacta serverul.");
                }
            });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">Inregistrare</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nume:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nume}
                            onChange={e => setNume(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Parola:</label>
                        <input
                            type="password"
                            className="form-control"
                            value={parola}
                            onChange={(e) => setParola(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
                        Creeaza cont
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p className="mb-0 text-muted">
                        Ai deja cont? <Link to="/login" className="text-decoration-none">Logheaza-te aici</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;