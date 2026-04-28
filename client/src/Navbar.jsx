import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Componenta Navbar
 * @description Bara de navigare principala.
 * Gestioneaza afisarea link-urilor, starea utilizatorului si accesul la panoul de admin.
 */
function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    /**
     * Verifica la incarcare daca avem utilizator salvat in LocalStorage.
     */
    useEffect(() => {
        const userLogat = localStorage.getItem('user');
        if (userLogat) {
            setUser(JSON.parse(userLogat));
        }
    }, []);

    /**
     * Gestioneaza deconectarea: sterge userul din memorie si redirectioneaza la Login.
     */
    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
            <div className="container">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link">Acasa</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {user ? (
                            <>
                                {user.rol === 'admin' && (
                                    <Link to="/admin" className="btn btn-warning btn-sm fw-bold">
                                        Admin
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    Deconectare
                                </button>
                            </>
                        ) : (
                            <Link to="/login">
                                <button className="btn btn-primary btn-sm">
                                    Logare
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;