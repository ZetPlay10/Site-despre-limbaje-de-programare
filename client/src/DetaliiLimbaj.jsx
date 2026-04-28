import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Componenta DetaliiLimbaj
 * Aceasta pagina afiseaza informatii detaliate despre un limbaj specific,
 * preluand datele (descriere, framework-uri, resurse) din backend pe baza ID-ului.
 */
function DetaliiLimbaj() {
    const { id } = useParams();

    const [limbaj, setLimbaj] = useState(null);
    const [frameworks, setFrameworks] = useState([]);
    const [resurse, setResurse] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Efect care gestioneaza incarcarea paralela a datelor folosind Promise.all.
     * Se asigura ca toate informatiile sunt disponibile inainte de randare.
     */
    useEffect(() => {
        const getLimbaj = axios.get(`http://127.0.0.1:8081/api/limbaj/${id}`);
        const getFrameworks = axios.get(`http://127.0.0.1:8081/api/frameworks/${id}`);
        const getResurse = axios.get(`http://127.0.0.1:8081/api/resurse/${id}`);

        Promise.all([getLimbaj, getFrameworks, getResurse])
            .then(([resLimbaj, resFram, resRes]) => {
                setLimbaj(resLimbaj.data);
                setFrameworks(resFram.data);
                setResurse(resRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Eroare la incarcarea detaliilor:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="text-center mt-5"><h3>Se incarca...</h3></div>;

    if (!limbaj) return <div className="text-center mt-5"><h3>Limbajul nu a fost gasit.</h3></div>;

    return (
        <div>
            <Navbar />

            <div className="bg-dark text-white py-5 mb-4">
                <div className="container d-flex align-items-center">
                    {limbaj.logo_url && (
                        <img
                            src={limbaj.logo_url}
                            alt={limbaj.nume}
                            style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                            className="me-4 bg-white rounded p-2"
                        />
                    )}
                    <div>
                        <h1 className="display-4 fw-bold">{limbaj.nume}</h1>
                        <span className="badge bg-primary fs-6 me-2">{limbaj.nivel_dificultate}</span>
                        <span className="text-white-50">Aparut in {limbaj.an_aparitie}</span>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <section className="mb-5">
                            <h3>Descriere</h3>
                            <p className="lead">{limbaj.descriere}</p>
                        </section>

                        <section className="mb-5">
                            <h3 className="mb-3">Framework-uri Populare</h3>
                            {frameworks.length > 0 ? (
                                <div className="row g-3">
                                    {frameworks.map(fw => (
                                        <div key={fw.id_framework} className="col-md-6">
                                            <div className="card h-100 border-primary">
                                                <div className="card-body">
                                                    <h5 className="card-title text-primary">{fw.nume}</h5>
                                                    <h6 className="card-subtitle mb-2 text-muted">{fw.tip}</h6>
                                                    <p className="card-text small">{fw.descriere}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">Nu exista framework-uri adaugate inca.</p>
                            )}
                        </section>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-success text-white">
                                📚 Resurse de Invatare
                            </div>
                            <ul className="list-group list-group-flush">
                                {resurse.length > 0 ? (
                                    resurse.map(res => (
                                        <li key={res.id_resursa} className="list-group-item">
                                            <a href={res.link} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold">
                                                {res.titlu}
                                            </a>
                                            <div className="d-flex justify-content-between mt-1">
                                                <span className="badge bg-secondary">{res.tip}</span>
                                                <small className="text-muted">{res.nivel_dificultate}</small>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-muted">Nu sunt resurse disponibile.</li>
                                )}
                            </ul>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-body text-center">
                                <h5>Ai folosit {limbaj.nume}?</h5>
                                <p className="text-muted">Spune-le si altora parerea ta.</p>
                                <button className="btn btn-outline-primary w-100">Scrie o Recenzie</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetaliiLimbaj;