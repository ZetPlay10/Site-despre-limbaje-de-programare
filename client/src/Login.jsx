import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Componenta Login
 * @description Gestioneaza autentificarea utilizatorilor.
 * Trimite datele (email, parola) catre server si salveaza token-ul/user-ul in LocalStorage la succes.
 */
function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [parola, setParola] = useState("");

    /**
     * Gestioneaza trimiterea formularului de login.
     * @param {Event} e - Evenimentul de submit.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        const dateLogin = {
            email: email,
            parola: parola
        };

        axios.post('http://127.0.0.1:8081/auth/login', dateLogin)
            .then(raspuns => {
                localStorage.setItem('user', JSON.stringify(raspuns.data));
                navigate("/home");
                window.location.reload();
            })
            .catch(err => {
                if (err.response) {
                    alert(err.response.data.message);
                } else {
                    alert("Eroare la conectarea cu serverul.");
                }
            });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4 fw-bold text-primary">Autentificare</h2>

                <form onSubmit={handleSubmit}>
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
                        Intra in cont
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p className="mb-0 text-muted">
                        Nu ai cont? <Link to="/register" className="text-decoration-none">Inregistreaza-te aici</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;