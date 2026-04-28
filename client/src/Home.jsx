import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Componenta Home
 * @description Pagina principala a aplicatiei.
 * Afiseaza lista de limbaje si permite filtrarea lor locala (dupa nume, nivel, domeniu).
 */
function Home() {
    const [limbaje, setLimbaje] = useState([]);
    const [cautare, setCautare] = useState('');
    const [filtruNivel, setFiltruNivel] = useState('Toate');
    const [filtruCategorie, setFiltruCategorie] = useState('Toate');

    const categoriiDisponibile = [
        'Toate', 'Web Development', 'Mobile Development',
        'Data Science', 'Systems Programming', 'Scripting'
    ];

    /**
     * Incarca toate limbajele de la server la pornirea paginii.
     */
    useEffect(() => {
        axios.get('http://127.0.0.1:8081/api/limbaje')
            .then(raspuns => {
                if (Array.isArray(raspuns.data)) {
                    setLimbaje(raspuns.data);
                } else {
                    setLimbaje([]);
                }
            })
            .catch(err => {
                console.error("Eroare la comunicarea cu serverul:", err);
            });
    }, []);

    /**
     * Logica de filtrare locala (Client-side).
     * Filtreaza lista de limbaje in functie de criteriile selectate.
     */
    const limbajeFiltrate = limbaje.filter(limbaj => {
        const matchNume = limbaj.nume.toLowerCase().includes(cautare.toLowerCase());
        const matchNivel = filtruNivel === 'Toate' || limbaj.nivel_dificultate === filtruNivel.toLowerCase();
        const categoriiLimbaj = limbaj.categorii || "";
        const matchCat = filtruCategorie === 'Toate' || categoriiLimbaj.includes(filtruCategorie);

        return matchNume && matchNivel && matchCat;
    });

    /**
     * Returneaza clasa CSS pentru culoarea badge-ului in functie de dificultate.
     * @param {string} nivel - Nivelul de dificultate (incepator, mediu, avansat).
     */
    const getBadgeColor = (nivel) => {
        if (!nivel) return 'bg-secondary';
        switch(nivel.toLowerCase()) {
            case 'incepator': return 'bg-success';
            case 'mediu': return 'bg-warning text-dark';
            case 'avansat': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div>
            <Navbar />

            <div className="bg-light py-5 mb-5 text-center shadow-sm">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Cauta un limbaj"
                                value={cautare}
                                onChange={e => setCautare(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mb-5">
                <div className="row g-3 align-items-center mb-4 p-3 bg-white rounded border">
                    <div className="col-md-6">
                        <label className="fw-bold me-2">Nivel:</label>
                        <div className="btn-group" role="group">
                            {['Toate', 'Incepator', 'Mediu', 'Avansat'].map(nivel => (
                                <button
                                    key={nivel}
                                    type="button"
                                    className={`btn ${filtruNivel === nivel ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setFiltruNivel(nivel)}
                                >
                                    {nivel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-6 d-flex align-items-center justify-content-md-end">
                        <label className="fw-bold me-2">Domeniu:</label>
                        <select
                            className="form-select w-auto"
                            value={filtruCategorie}
                            onChange={e => setFiltruCategorie(e.target.value)}
                        >
                            {categoriiDisponibile.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {limbajeFiltrate.length > 0 ? (
                        limbajeFiltrate.map((limbaj) => (
                            <div key={limbaj.id_limbaj} className="col">
                                <div className="card h-100 shadow-sm border-0 hover-effect">
                                    <div className="card-body d-flex flex-column">

                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className={`badge rounded-pill ${getBadgeColor(limbaj.nivel_dificultate)}`}>
                                                {limbaj.nivel_dificultate}
                                            </span>
                                            <small className="text-muted fw-bold">{limbaj.an_aparitie}</small>
                                        </div>

                                        <h3 className="card-title text-primary">{limbaj.nume}</h3>

                                        <div className="mb-3">
                                            {limbaj.categorii ? limbaj.categorii.split(', ').map((tag, index) => (
                                                <span key={index} className="badge bg-light text-dark border me-1">
                                                    {tag}
                                                </span>
                                            )) : <span className="badge bg-light text-dark">General</span>}
                                        </div>

                                        <p className="card-text text-secondary flex-grow-1">
                                            {limbaj.descriere.length > 100
                                                ? limbaj.descriere.substring(0, 100) + "..."
                                                : limbaj.descriere}
                                        </p>

                                        <Link to={`/detalii/${limbaj.id_limbaj}`} className="btn btn-outline-primary mt-3 w-100">
                                            Vezi detalii
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h3 className="text-muted">Nu am gasit niciun limbaj.</h3>
                            <p>Incearca sa schimbi filtrele de cautare.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;