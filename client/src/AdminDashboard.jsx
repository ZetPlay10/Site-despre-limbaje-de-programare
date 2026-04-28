import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Componenta AdminDashboard
 * Aceasta componenta se ocupa de administrarea aplicatiei (CRUD si Rapoarte).
 * Varianta cu font Times New Roman pentru corectia textului in PDF.
 */
function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({ utilizatori: 0, limbaje: 0, recenzii: 0, resurse: 0 });
    const [listaLimbaje, setListaLimbaje] = useState([]);
    const [listaUtilizatori, setListaUtilizatori] = useState([]);

    const [activeTab, setActiveTab] = useState('gestiune');
    const [activeForm, setActiveForm] = useState(null);
    const [editId, setEditId] = useState(null);

    const [langForm, setLangForm] = useState({ nume: '', descriere: '', an_aparitie: '', nivel_dificultate: 'incepator', logo_url: '' });
    const [fwForm, setFwForm] = useState({ id_limbaj: '', nume: '', descriere: '', tip: 'web' });
    const [resForm, setResForm] = useState({ id_limbaj: '', titlu: '', link: '', tip: 'documentatie', nivel_dificultate: 'incepator' });
    const [userForm, setUserForm] = useState({ email: '', rol: 'user' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.rol !== 'admin') {
            navigate('/home');
            return;
        }
        refreshData();
    }, [navigate]);

    const refreshData = () => {
        axios.get('http://127.0.0.1:8081/admin/stats').then(res => setStats(res.data)).catch(console.error);
        axios.get('http://127.0.0.1:8081/api/limbaje').then(res => setListaLimbaje(res.data)).catch(console.error);
        axios.get('http://127.0.0.1:8081/admin/users').then(res => setListaUtilizatori(res.data)).catch(console.error);
    };

    const startEditLimbaj = (l) => {
        setEditId(l.id_limbaj);
        setLangForm(l);
        setActiveForm('limbaj');
        window.scrollTo(0, 0);
    };

    const startEditUser = (u) => {
        setEditId(u.id_utilizator);
        setUserForm({ email: u.email, rol: u.rol });
        setActiveForm('user_edit');
    };

    const resetForm = () => {
        setEditId(null);
        setLangForm({ nume: '', descriere: '', an_aparitie: '', nivel_dificultate: 'incepator', logo_url: '' });
        setUserForm({ email: '', rol: 'user' });
        setActiveForm(null);
    };

    const submitLimbaj = (e) => {
        e.preventDefault();
        const req = editId ? axios.put(`http://127.0.0.1:8081/admin/limbaje/${editId}`, langForm) : axios.post('http://127.0.0.1:8081/admin/limbaje', langForm);
        req.then(() => { refreshData(); resetForm(); alert("Succes!"); }).catch(() => alert("Eroare!"));
    };

    const submitUser = (e) => {
        e.preventDefault();
        axios.put(`http://127.0.0.1:8081/admin/users/${editId}`, userForm)
            .then(() => { refreshData(); resetForm(); alert("Succes!"); })
            .catch(() => alert("Eroare!"));
    };

    const submitFramework = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8081/admin/frameworks', fwForm)
            .then(() => { refreshData(); e.target.reset(); alert("Succes!"); })
            .catch(() => alert("Eroare!"));
    };

    const submitResursa = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8081/admin/resurse', resForm)
            .then(() => { refreshData(); e.target.reset(); alert("Succes!"); })
            .catch(() => alert("Eroare!"));
    };

    const stergeLimbaj = (id) => { if (window.confirm("Stergi?")) axios.delete(`http://127.0.0.1:8081/admin/limbaje/${id}`).then(() => { refreshData(); alert("Sters!"); }); };
    const stergeUser = (id) => { if (window.confirm("Stergi?")) axios.delete(`http://127.0.0.1:8081/admin/users/${id}`).then(() => { refreshData(); alert("Sters!"); }); };

    const curataText = (str) => {
        if (!str) return "";
        return str.toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ă/g, "a").replace(/Ă/g, "A")
            .replace(/î/g, "i").replace(/Î/g, "I")
            .replace(/ș/g, "s").replace(/Ș/g, "S")
            .replace(/ț/g, "t").replace(/Ț/g, "T")
            .replace(/â/g, "a").replace(/Â/g, "A");
    };

    /**
     * Genereaza un raport PDF complet.
     * Interogheaza backend-ul pentru 30 de seturi de date si le formateaza in tabele.
     */
    const generateFullPDF = async () => {
        try {
            alert("Se genereaza raportul... Te rog asteapta.");
            const response = await axios.get('http://127.0.0.1:8081/admin/raport-complet');
            const data = response.data;
            const doc = new jsPDF();

            doc.setFont("times", "normal");

            doc.setFontSize(18); doc.setTextColor(0, 51, 102);
            doc.text(curataText("Raport: Rezultatele celor 30 query-uri SQL"), 14, 20);

            doc.setFontSize(10); doc.setTextColor(100);
            doc.text(`Data generarii: ${new Date().toLocaleString()}`, 14, 26);

            let y = 35;

            const addQueryText = (nr, descriere, rezultat) => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFontSize(10); doc.setTextColor(0); doc.setFont("times", "bold");
                doc.text(curataText(`Query ${nr}: ${descriere}`), 14, y, { maxWidth: 130 });
                doc.setFont("times", "normal");
                doc.text(`Rezultat: ${rezultat}`, 180, y, { align: 'right' });
                y += 10;
            };

            const addQueryTable = (nr, descriere, head, body) => {
                if (y > 240) { doc.addPage(); y = 20; }
                doc.setFontSize(11); doc.setTextColor(0, 51, 102); doc.setFont("times", "bold");
                doc.text(curataText(`Query ${nr}: ${descriere}`), 14, y, { maxWidth: 180 });
                y += 4;

                const cleanHead = head.map(h => curataText(h));
                const cleanBody = body.map(row => row.map(cell => curataText(cell)));

                autoTable(doc, {
                    startY: y + 2,
                    head: [cleanHead],
                    body: cleanBody,
                    theme: 'grid',
                    styles: { font: "times", fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [60, 60, 60] }
                });
                y = doc.lastAutoTable.finalY + 12;
            };

            doc.setFontSize(14); doc.setTextColor(200, 0, 0);
            doc.text("I. Statistici generale", 14, y); y += 12;

            addQueryText(1, "Total utilizatori inregistrati", data.stats.total_users);
            addQueryText(2, "Numar total de limbaje", data.stats.total_limbaje);
            addQueryText(3, "Total framework-uri disponibile", data.stats.total_frameworks);
            addQueryText(4, "Resurse educationale", data.stats.total_resurse);
            addQueryText(5, "Mentori activi", data.stats.total_mentori);
            addQueryText(6, "Recenzii lasate de useri", data.stats.total_recenzii);
            addQueryText(7, "Categorii (Domenii)", data.stats.total_categorii);
            addQueryText(8, "Numar administratori", data.stats.total_admini);

            y += 5;

            doc.setFontSize(14); doc.setTextColor(200, 0, 0);
            doc.text("II. Filtrari", 14, y); y += 12;

            addQueryTable(9, "Limbaje pentru incepatori", ["Nume", "An"], data.limbaje_incepatori.map(l => [l.nume, l.an_aparitie]));
            addQueryTable(10, "Limbaje nivel avansat", ["Nume", "An"], data.limbaje_avansati.map(l => [l.nume, l.an_aparitie]));
            addQueryTable(11, "Limbaje clasice (inainte de 2000)", ["Nume", "An"], data.limbaje_vechi.map(l => [l.nume, l.an_aparitie]));
            addQueryTable(12, "Framework-uri de tip Web", ["Nume", "Descriere"], data.frameworks_web.map(f => [f.nume, f.descriere]));
            addQueryTable(13, "Resurse Video Disponibile", ["Titlu", "Link"], data.resurse_video.map(r => [r.titlu, r.link]));
            addQueryTable(14, "Mentori Seniori (>5 ani exp)", ["Nume", "Ani Exp"], data.mentori_seniori.map(m => [m.nume_complet, m.ani_experienta]));
            addQueryTable(15, "Recenzii de 5 stele", ["Comentariu", "Rating"], data.recenzii_top.map(r => [r.comentariu, r.rating]));

            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14); doc.setTextColor(200, 0, 0);
            doc.text("III. Sortari", 14, y); y += 12;

            addQueryTable(16, "Cel mai vechi limbaj", ["Nume", "An"], data.cel_mai_vechi_limbaj.map(l => [l.nume, l.an_aparitie]));
            addQueryTable(17, "Cel mai nou limbaj", ["Nume", "An"], data.cel_mai_nou_limbaj.map(l => [l.nume, l.an_aparitie]));
            addQueryTable(18, "Top 3 Mentori dupa experienta", ["Nume", "Ani Exp"], data.top_mentori_exp.map(m => [m.nume_complet, m.ani_experienta]));
            addQueryTable(19, "Ultimii 5 utilizatori inscrisi", ["User", "Email", "Data"], data.ultimii_useri.map(u => [u.username, u.email, new Date(u.data_inregistrare).toLocaleDateString()]));
            addQueryTable(20, "5 Resurse Avansate", ["Titlu"], data.resurse_dificile.map(r => [r.titlu]));

            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14); doc.setTextColor(200, 0, 0);
            doc.text("IV. Join-uri", 14, y); y += 12;

            addQueryTable(21, "Numar framework-uri per limbaj", ["Limbaj", "Total Fw"], data.nr_frameworks_per_limbaj.map(x => [x.nume, x.nr]));
            addQueryTable(22, "Lista Framework-uri si Limbajul Parinte", ["Framework", "Limbaj", "Tip"], data.frameworks_cu_limbaj.map(x => [x.framework, x.limbaj, x.tip]));
            addQueryTable(23, "Numar Resurse per Limbaj", ["Limbaj", "Total Resurse"], data.resurse_per_limbaj.map(x => [x.nume, x.nr]));
            addQueryTable(24, "Rating Mediu per Limbaj", ["Limbaj", "Nota Medie"], data.rating_mediu_limbaj.map(x => [x.nume, parseFloat(x.medie).toFixed(1)]));
            addQueryTable(25, "Mentori si ce limbaje predau", ["Mentor", "Limbaj"], data.mentori_si_limbaje.map(x => [x.nume_complet, x.limbaj]));
            addQueryTable(26, "Utilizatori care au lasat recenzii", ["Username"], data.useri_activi_recenzii.map(x => [x.username]));
            addQueryTable(27, "Categorii si numarul de limbaje", ["Categorie", "Nr. Limbaje"], data.categorii_stats.map(x => [x.nume, x.nr]));
            addQueryTable(28, "Limbaje care au cel putin un framework", ["Limbaj"], data.limbaje_cu_frameworks.map(x => [x.nume]));
            addQueryTable(29, "Studenti inscrisi la Mentori", ["Student", "Mentor"], data.mentorat_activ.map(x => [x.student, x.mentor]));
            addQueryTable(30, "Framework-uri Specializate (Data Science/Mobile)", ["Nume"], data.frameworks_specializate.map(x => [x.nume]));

            doc.save("Raport_30_Query_Proiect.pdf");
        } catch (err) {
            console.error(err);
            alert("Eroare! Verifica daca backend-ul ruleaza.");
        }
    };

    const pdfLimbaje = () => {
        const doc = new jsPDF();
        doc.setFont("times", "normal");
        doc.text("Raport Simplu: Limbaje", 14, 20);
        autoTable(doc, { head: [["ID", "Nume", "An", "Dificultate"]], body: listaLimbaje.map(l => [l.id_limbaj, l.nume, l.an_aparitie, l.nivel_dificultate]), startY: 30, styles: { font: "times" } });
        doc.save("raport_limbaje.pdf");
    };

    const pdfUsers = () => {
        const doc = new jsPDF();
        doc.setFont("times", "normal");
        doc.text("Raport Simplu: Utilizatori", 14, 20);
        autoTable(doc, { head: [["ID", "Email", "Rol"]], body: listaUtilizatori.map(u => [u.id_utilizator, u.email, u.rol]), startY: 30, styles: { font: "times" } });
        doc.save("raport_utilizatori.pdf");
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5 mb-5">
                <h1 className="mb-4 fw-bold">Panou administrare</h1>

                <div className="row g-4 mb-4">
                    <StatCard title="Utilizatori" value={stats.utilizatori} color="primary" />
                    <StatCard title="Limbaje" value={stats.limbaje} color="success" />
                    <StatCard title="Framework-uri" value={stats.recenzii} color="warning" />
                    <StatCard title="Resurse" value={stats.resurse} color="info" />
                </div>

                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'gestiune' ? 'active fw-bold' : ''}`} onClick={() => { setActiveTab('gestiune'); resetForm(); }}>Gestiune date</button></li>
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'users' ? 'active fw-bold' : ''}`} onClick={() => { setActiveTab('users'); resetForm(); }}>Utilizatori</button></li>
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'rapoarte' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('rapoarte')}>Rapoarte</button></li>
                </ul>

                {activeTab === 'gestiune' && (
                    <div>
                        <h3 className="mb-3">{editId ? "Modifica" : "Adauga"}</h3>
                        {!editId && (
                            <div className="btn-group mb-4">
                                <button className={`btn ${activeForm === 'limbaj' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveForm('limbaj')}>Adauga Limbaj</button>
                                <button className={`btn ${activeForm === 'framework' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveForm('framework')}>Adauga Framework</button>
                                <button className={`btn ${activeForm === 'resursa' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveForm('resursa')}>Adauga Resursa</button>
                            </div>
                        )}
                        {editId && <button className="btn btn-secondary mb-3" onClick={resetForm}>Anuleaza editarea</button>}

                        {activeForm === 'limbaj' && (
                            <div className="card p-4 shadow bg-light mb-4 border-primary">
                                <form onSubmit={submitLimbaj} className="row g-3">
                                    <div className="col-md-6"><input className="form-control" placeholder="Nume" value={langForm.nume} onChange={e => setLangForm({ ...langForm, nume: e.target.value })} required /></div>
                                    <div className="col-md-3"><input type="number" className="form-control" placeholder="An" value={langForm.an_aparitie} onChange={e => setLangForm({ ...langForm, an_aparitie: e.target.value })} /></div>
                                    <div className="col-md-3"><select className="form-select" value={langForm.nivel_dificultate} onChange={e => setLangForm({ ...langForm, nivel_dificultate: e.target.value })}><option value="incepator">Incepator</option><option value="mediu">Mediu</option><option value="avansat">Avansat</option></select></div>
                                    <div className="col-12"><textarea className="form-control" placeholder="Descriere" value={langForm.descriere} onChange={e => setLangForm({ ...langForm, descriere: e.target.value })} /></div>
                                    <div className="col-12"><button className={`btn ${editId ? 'btn-warning' : 'btn-success'} w-100`}>Salveaza</button></div>
                                </form>
                            </div>
                        )}
                        {activeForm === 'framework' && !editId && (
                            <div className="card p-4 shadow bg-light mb-4">
                                <form onSubmit={submitFramework} className="row g-3">
                                    <div className="col-md-12"><select className="form-select" onChange={e => setFwForm({ ...fwForm, id_limbaj: e.target.value })} required><option value="">-- Alege Limbaj --</option>{listaLimbaje.map(l => <option key={l.id_limbaj} value={l.id_limbaj}>{l.nume}</option>)}</select></div>
                                    <div className="col-md-6"><input className="form-control" placeholder="Nume" onChange={e => setFwForm({ ...fwForm, nume: e.target.value })} required /></div>
                                    <div className="col-md-6"><input className="form-control" placeholder="Tip" onChange={e => setFwForm({ ...fwForm, tip: e.target.value })} /></div>
                                    <div className="col-12"><textarea className="form-control" placeholder="Descriere" onChange={e => setFwForm({ ...fwForm, descriere: e.target.value })} /></div>
                                    <div className="col-12"><button className="btn btn-success">Salveaza Framework</button></div>
                                </form>
                            </div>
                        )}
                        {activeForm === 'resursa' && (
                            <div className="card p-4 shadow bg-light mb-4">
                                <form onSubmit={submitResursa} className="row g-3">
                                    <div className="col-md-12"><select className="form-select" onChange={e => setResForm({ ...resForm, id_limbaj: e.target.value })} required><option value="">-- Alege Limbaj --</option>{listaLimbaje.map(l => <option key={l.id_limbaj} value={l.id_limbaj}>{l.nume}</option>)}</select></div>
                                    <div className="col-md-6"><input className="form-control" placeholder="Titlu" onChange={e => setResForm({ ...resForm, titlu: e.target.value })} required /></div>
                                    <div className="col-md-6"><input className="form-control" placeholder="Link" onChange={e => setResForm({ ...resForm, link: e.target.value })} required /></div>
                                    <div className="col-12"><button className="btn btn-success">Salveaza Resursa</button></div>
                                </form>
                            </div>
                        )}
                        <div className="card p-4 shadow mt-4">
                            <h4 className="mb-3">Limbaje</h4>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead className="table-dark"><tr><th>ID</th><th>Nume</th><th>Actiuni</th></tr></thead>
                                    <tbody>
                                    {listaLimbaje.map(l => (
                                        <tr key={l.id_limbaj}><td>{l.id_limbaj}</td><td className="fw-bold">{l.nume}</td><td><button className="btn btn-warning btn-sm me-2" onClick={() => startEditLimbaj(l)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => stergeLimbaj(l.id_limbaj)}>Sterge</button></td></tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="card p-4 shadow">
                        <h4 className="mb-3">Utilizatori</h4>
                        {activeForm === 'user_edit' && editId && (
                            <div className="card p-3 mb-4 bg-warning bg-opacity-10 border-warning">
                                <form onSubmit={submitUser} className="row g-2 align-items-end">
                                    <div className="col-md-5"><input className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} /></div>
                                    <div className="col-md-3"><select className="form-select" value={userForm.rol} onChange={e => setUserForm({ ...userForm, rol: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div>
                                    <div className="col-md-4"><button className="btn btn-success me-2">Salveaza</button><button type="button" className="btn btn-secondary" onClick={resetForm}>Anuleaza</button></div>
                                </form>
                            </div>
                        )}
                        <table className="table table-bordered table-hover"><thead className="table-dark"><tr><th>Email</th><th>Rol</th><th>Actiune</th></tr></thead>
                            <tbody>{listaUtilizatori.map(u => (<tr key={u.id_utilizator}><td>{u.email}</td><td><span className={`badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.rol}</span></td><td><button className="btn btn-warning btn-sm me-2" onClick={() => startEditUser(u)}>Edit</button>{u.rol !== 'admin' && <button className="btn btn-danger btn-sm" onClick={() => stergeUser(u.id_utilizator)}>Sterge</button>}</td></tr>))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'rapoarte' && (
                    <div className="text-center py-5">
                        <h3 className="mb-4 text-primary fw-bold">Export rapoarte SQL</h3>
                        <div className="card shadow border-success p-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            <h2 className="text-success mb-3">Raport complet (30 Query-uri)</h2>
                            <button className="btn btn-success btn-lg w-100 py-3 fw-bold" onClick={generateFullPDF}>DESCARCA RAPORTUL</button>
                            <div className="mt-3 d-flex gap-2 justify-content-center">
                                <button className="btn btn-outline-secondary btn-sm" onClick={pdfLimbaje}>Lista Simpla Limbaje</button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={pdfUsers}>Lista Simpla Useri</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return <div className="col-md-3"><div className={`card text-white bg-${color} h-100 shadow`}><div className="card-body text-center"><h5 className="card-title">{title}</h5><p className="display-4 fw-bold">{value}</p></div></div></div>;
}

export default AdminDashboard;