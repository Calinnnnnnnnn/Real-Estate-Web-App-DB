import React, { useState, useEffect } from "react";
import Navbar from "../components_properties/Properties/Navbar/Navbar";
import './Profile.scss';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [adsData, setAdsData] = useState([]);

    //useState pentru sectiunea de vizionari
    const [visitsData, setVisitsData] = useState([]); // Noua stare pentru vizionări programate
    const [errorMessageVisits, setErrorMessageVisits] = useState('');
    const [successMessageVisits, setSuccessMessageVisits] = useState('');


    //succes si error pentru profil
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isEditingAds, setIsEditingAds] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [editedAdData, setEditedAdData] = useState({});

    //succes si erorr pentru ads
    const [errorMessageAds, setErrorMessageAds] = useState('');
    const [successMessageAds, setSuccessMessageAds] = useState('');

    const [isAddingAd, setIsAddingAd] = useState(false);
    const [newAdData, setNewAdData] = useState({
        titlu: '',
        descriere: '',
        pret: '',
        adresa: '',
        categorie: '',
        nr_camere: '',
        suprafata: '',
        an_constructie: '',
        imagine: '',
    });

    const email = localStorage.getItem('userEmail');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO'); 
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setPhoneNumber(data.nr_telefon); 
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchAdsData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile/ads?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setAdsData(data);
                } else {
                    console.error('Failed to fetch ads data');
                }
            } catch (error) {
                console.error('Error fetching ads data:', error);
            }
        };

        const fetchVisitsData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile/visits?email=${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setVisitsData(data);
                } else {
                    console.error('Failed to fetch visits data');
                }
            } catch (error) {
                console.error('Error fetching visits data:', error);
            }
        };

        if (email) {
            fetchUserData();
            fetchAdsData();
            fetchVisitsData();
        }
    }, [email]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:3000/profile/update-phone', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nr_telefon: phoneNumber }),
            });

            if (response.ok) {
                const updatedData = { ...userData, nr_telefon: phoneNumber };
                setUserData(updatedData);
                setIsEditing(false);
                setSuccessMessage('Modificările s-au efectuat cu succes!');
            } else {
                const errorResponse = await response.json();
                setErrorMessage('Număr de telefon deja existent!');
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
            setErrorMessage('Eroare la actualizarea numărului.');
        }
    };

    const handleDeleteAd = async (adId) => {
        const isConfirmed = window.confirm("Ești sigur că dorești să ștergi acest anunț? Această acțiune este ireversibilă.");
        if (!isConfirmed) {
            return; // Dacă utilizatorul anulează, ieșim din funcție
        }

        try {
            const response = await fetch(`http://localhost:3000/profile/ads/${adId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                setAdsData((prevAds) => prevAds.filter((ad) => ad.id_add !== adId));
            } else {
                console.error('Eroare la ștergerea anunțului');
            }
        } catch (error) {
            console.error('Eroare la conectarea cu serverul:', error);
        }
    };

    const handleEditAd = (ad) => {
        setEditingAd(ad.id_add);
        setEditedAdData({
            titlu: ad.titlu || '', // Folosește valoarea din `ad` sau un string gol
            descriere: ad.descriere || '',
            pret: ad.pret || '',
            status: ad.status || 'cumparare', // Valoare implicită, dacă este necesar
            adresa: ad.adresa || '',
            categorie: ad.id_categorie || '1', // Asigură-te că `ad` conține `id_categorie`
            nr_camere: ad.nr_camere || '',
            suprafata: ad.suprafata || '',
            an_constructie: ad.an_constructie || '',
            imagine: ad.imagine || '', // Asigură-te că `ad` conține URL-ul imaginii
        });
    };

    const handleAddAd = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:3000/profile/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAdData, email }),
            });
    
            if (response.ok) {
                const newAd = await response.json();
                setAdsData((prevAds) => [...prevAds, newAd]);
                setIsAddingAd(false);
                setNewAdData({
                    titlu: '',
                    descriere: '',
                    pret: '',
                    adresa: '',
                    categorie: '',
                    nr_camere: '',
                    suprafata: '',
                    an_constructie: '',
                    imagine: '',
                });
            } else {
                console.error('Eroare la adăugarea anunțului:', await response.json());
            }
        } catch (error) {
            console.error('Eroare la conectarea cu serverul:', error);
        }
    };

    const handleSaveAdChanges = async () => {
        setErrorMessageAds('');
        setSuccessMessageAds('');
    
        const validStatuses = ['cumparare', 'inchiriere', 'cumparat', 'inchiriat', 'rezervat'];
    
        if (!validStatuses.includes(editedAdData.status)) {
            setErrorMessageAds(`Statusul "${editedAdData.status}" nu este valid.`);
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/profile/ads/${editingAd}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titlu: editedAdData.titlu,
                    descriere: editedAdData.descriere,
                    pret: editedAdData.pret,
                    status: editedAdData.status,
                    adresa: editedAdData.adresa,
                    categorie: editedAdData.categorie,
                    nr_camere: editedAdData.nr_camere,
                    suprafata: editedAdData.suprafata,
                    an_constructie: editedAdData.an_constructie,
                    imagine: editedAdData.imagine,
                }),
            });
    
            if (response.ok) {
                const updatedAds = adsData.map((ad) =>
                    ad.id_add === editingAd ? { ...ad, ...editedAdData } : ad
                );
                setAdsData(updatedAds);
                setEditingAd(null); // Resetăm modul de editare
                setSuccessMessageAds('Modificările s-au efectuat cu succes!');
            } else {
                console.error('Eroare la actualizarea anunțului:', await response.json());
                setErrorMessageAds('Eroare la modificarea anunțului.');
            }
        } catch (error) {
            console.error('Eroare la conectarea cu serverul:', error);
        }
    };
    
    if (!userData) return <div>Loading...</div>;

    return (
        <div className="profile-page">
            <div className="navbar-profile"><Navbar /></div>
            <div className="profile-content">
                <div className="profile-section">
                    <h1>Profil Utilizator</h1>
                    {errorMessage && <p className="error-message-profile">{errorMessage}</p>}
                    {successMessage && <p className="success-message-profile">{successMessage}</p>}
                    <p><strong>ID:</strong> {userData.id_user}</p>
                    <p><strong>Nume:</strong> {userData.nume}</p>
                    <p><strong>Prenume:</strong> {userData.prenume}</p>
                    <p><strong>Tip Utilizator:</strong> {userData.tip_utilizator}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Telefon:</strong></p>
                    {isEditing ? (
                        <div className="edit-buttons">
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <button onClick={handleSaveClick}>Salvează</button>
                            <button onClick={() => setIsEditing(false)}>Anulează</button>
                        </div>
                    ) : (
                        <div className="edit-buttons">
                            <span>{userData.nr_telefon}</span>
                            <button onClick={handleEditClick}>Editează</button>
                        </div>
                    )}
                    <p><strong>Data Înregistrării:</strong> {formatDate(userData.data_inregistrare)}</p>
                </div>


                <div className="ads-section">
                    <h2>Anunțurile Mele</h2>
                    <div className="ads-actions">
                        <button className="toggle-edit-btn" onClick={() => setIsEditingAds(!isEditingAds)}>
                            {isEditingAds ? 'Închide Modificarea Anunțurilor' : 'Modifică Anunțuri'}
                        </button>
                        <button className="add-ad-btn" onClick={() => setIsAddingAd(true)}>
                            Adaugă Anunț
                        </button>
                    </div>


                    {isAddingAd && (
                        <div className="add-ad-form">
                            <h3>Adaugă un Nou Anunț</h3>
                            <form onSubmit={handleAddAd}>
                                <input
                                    type="text"
                                    placeholder="Titlu"
                                    value={newAdData.titlu}
                                    onChange={(e) => setNewAdData({ ...newAdData, titlu: e.target.value })}
                                />
                                <textarea
                                    placeholder="Descriere"
                                    value={newAdData.descriere}
                                    onChange={(e) => setNewAdData({ ...newAdData, descriere: e.target.value })}
                                ></textarea>
                                <input
                                    type="number"
                                    placeholder="Preț"
                                    value={newAdData.pret}
                                    onChange={(e) => setNewAdData({ ...newAdData, pret: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Adresă"
                                    value={newAdData.adresa}
                                    onChange={(e) => setNewAdData({ ...newAdData, adresa: e.target.value })}
                                />
                                <select
                                    value={newAdData.categorie}
                                    onChange={(e) => setNewAdData({ ...newAdData, categorie: e.target.value })}
                                >
                                    <option value="">Selectează Categoria</option>
                                    <option value="1">Apartamente</option>
                                    <option value="2">Case</option>
                                    <option value="3">Terenuri</option>
                                    <option value="4">Spații Comerciale</option>
                                    <option value="5">Garaje</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Număr camere"
                                    value={newAdData.nr_camere}
                                    onChange={(e) => setNewAdData({ ...newAdData, nr_camere: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Suprafață (mp)"
                                    value={newAdData.suprafata}
                                    onChange={(e) => setNewAdData({ ...newAdData, suprafata: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="An construcție"
                                    value={newAdData.an_constructie}
                                    onChange={(e) => setNewAdData({ ...newAdData, an_constructie: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="URL Imagine"
                                    value={newAdData.imagine}
                                    onChange={(e) => setNewAdData({ ...newAdData, imagine: e.target.value })}
                                />
                                <button type="submit">Salvează</button>
                                <button type="button" onClick={() => setIsAddingAd(false)}>Anulează</button>
                            </form>
                        </div>
                    )}

                    {isEditingAds && (
                        <div className="ads-edit-instructions">
                            <p>Selectează un anunț pentru a-l modifica sau șterge.</p>
                        </div>
                    )}
                    {errorMessageAds && <p className="error-message-ads">{errorMessageAds}</p>}
                    {successMessageAds && <p className="success-message-ads">{successMessageAds}</p>}
                    {adsData.length > 0 ? (
                        <div className="ads-list">
                            {adsData.map((ad) => (
                                <div key={ad.id_add} className="ad-card">
                                    {editingAd === ad.id_add ? (
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                value={editedAdData.titlu}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, titlu: e.target.value })}
                                                placeholder="Titlu"
                                            />
                                            <textarea
                                                value={editedAdData.descriere}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, descriere: e.target.value })}
                                                placeholder="Descriere"
                                            ></textarea>
                                            <input
                                                type="number"
                                                value={editedAdData.pret}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, pret: e.target.value })}
                                                placeholder="Preț"
                                            />
                                            <select
                                                value={editedAdData.status}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, status: e.target.value })}
                                            >
                                                <option value="cumparare">Cumparare</option>
                                                <option value="inchiriere">Inchiriere</option>
                                                <option value="cumparat">Cumparat</option>
                                                <option value="inchiriat">Inchiriat</option>
                                                <option value="rezervat">Rezervat</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={editedAdData.adresa}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, adresa: e.target.value })}
                                                placeholder="Adresă"
                                            />
                                            <select
                                                value={editedAdData.categorie}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, categorie: e.target.value })}
                                            >
                                                <option value="1">Apartamente</option>
                                                <option value="2">Case</option>
                                                <option value="3">Terenuri</option>
                                                <option value="4">Spații Comerciale</option>
                                                <option value="5">Garaje</option>
                                            </select>
                                            <input
                                                type="number"
                                                value={editedAdData.nr_camere}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, nr_camere: e.target.value })}
                                                placeholder="Număr camere"
                                            />
                                            <input
                                                type="number"
                                                value={editedAdData.suprafata}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, suprafata: e.target.value })}
                                                placeholder="Suprafață (mp)"
                                            />
                                            <input
                                                type="number"
                                                value={editedAdData.an_constructie}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, an_constructie: e.target.value })}
                                                placeholder="An construcție"
                                            />
                                            <input
                                                type="text"
                                                value={editedAdData.imagine}
                                                onChange={(e) => setEditedAdData({ ...editedAdData, imagine: e.target.value })}
                                                placeholder="URL Imagine"
                                            />
                                            <button onClick={handleSaveAdChanges}>Salvează</button>
                                            <button onClick={() => setEditingAd(null)}>Anulează</button>
                                        </div>
                                    ) : (
                                        <>
                                            <img src={ad.imagine} alt={ad.titlu} />
                                            <h3>{ad.titlu}</h3>
                                            <p><strong>Preț:</strong> {ad.pret} USD</p>
                                            <p><strong>Status:</strong> {ad.status}</p>
                                            <p><strong>Adresă:</strong> {ad.adresa}</p>
                                            <p><strong>Descriere:</strong> {ad.descriere}</p>
                                            <p><strong>Număr Camere:</strong> {ad.nr_camere}</p>
                                            <p><strong>Suprafață:</strong> {ad.suprafata} mp</p>
                                            <p><strong>Categorie:</strong> {ad.categorie}</p>
                                            <p><strong>An construcție:</strong> {ad.an_constructie}</p>
                                            {isEditingAds && (
                                                <div className="ad-actions">
                                                    <button className="edit-btn" onClick={() => handleEditAd(ad)}>Modifică</button>
                                                    <button className="delete-btn" onClick={() => handleDeleteAd(ad.id_add)}>Șterge</button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Nu ai încă anunțuri publicate.</p>
                    )}
                </div>

                <div className="visits-section">
                    <h2>Vizionările Programate</h2>
                    {visitsData.length > 0 ? (
                        <div className="visits-list">
                            {visitsData.map((visit) => (
                                <div key={visit.id_vizionare} className="visit-card">
                                    <p><strong>Proprietate:</strong> {visit.proprietate_titlu}</p>
                                    <p><strong>Data Vizionării:</strong> {new Date(visit.data_vizionare).toLocaleDateString('ro-RO')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Nu ai nicio vizionare programată.</p>
                    )}
                    {errorMessageVisits && <p className="error-message-visits">{errorMessageVisits}</p>}
                    {successMessageVisits && <p className="success-message-visits">{successMessageVisits}</p>}
                </div>
            </div>
        </div>
);
}

export default Profile;
