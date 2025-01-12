import React, { useEffect, useState } from 'react';
import PieChart from './PieChart';
import './Admin.scss';
import { Pie } from 'react-chartjs-2';

const Admin = () => {
    const [adminData, setAdminData] = useState({
        prenume: '',
        id_user: '',
        email: '',
    });
    const [selectedTable, setSelectedTable] = useState(''); // Tabelul selectat
    const [tableData, setTableData] = useState([]); // Datele din tabel
    const [filteredData, setFilteredData] = useState([]); // Datele filtrate
    const [sortConfig, setSortConfig] = useState(null); // Configurarea sortării
    const [activeOption, setActiveOption] = useState(null); // Opțiunea activă din meniul lateral
    const [searchField, setSearchField] = useState(''); // Câmpul pentru căutare
    const [searchTerm, setSearchTerm] = useState(''); // Termenul de căutare
    const [modalData, setModalData] = useState({
        isOpen: false,
        content: {},
    }); // Starea pentru modal

    const [newRowData, setNewRowData] = useState({}); // Datele pentru noul rând
    const [isAddingRow, setIsAddingRow] = useState(false); // Starea pentru a ști dacă formularul este deschis

    const [showStats, setShowStats] = useState(false);
    const [numAnunturi, setNumAnunturi] = useState(0);
    const [numUtilizatori, setNumUtilizatori] = useState(0);
    const [numProprietati, setNumProprietati] = useState(0);

    const userEmail = localStorage.getItem('userEmail');

    const convertDateToMySQLFormat = (dateString) => {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('.');
        return `${year}-${month}-${day} ${timePart}`;
    };

    const formatDate = (value) => {
        if (
            typeof value === 'string' &&
            !isNaN(Date.parse(value)) &&
            (value.includes('-') || value.includes('/'))
        ) {
            const date = new Date(value);
            return date.toLocaleString('ro-RO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }
        return value;
    };
    
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/profile?email=${encodeURIComponent(userEmail)}`);
                if (response.ok) {
                    const data = await response.json();
                    setAdminData({
                        prenume: data.prenume,
                        id_user: data.id_user,
                        email: data.email,
                    });
                } else {
                    console.error('Eroare la obținerea datelor adminului.');
                }
            } catch (error) {
                console.error('Eroare de rețea:', error);
            }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3000/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    setNumAnunturi(data.numAnunturi);
                    setNumUtilizatori(data.numUtilizatori);
                    setNumProprietati(data.numProprietati);
                } else {
                    console.error('Eroare la obținerea numărului de anunțuri.');
                }
            } catch (error) {
                console.error('Eroare de rețea:', error);
            }
        };

        fetchAdminData();
        fetchStats();
    }, [userEmail]);

    const fetchTableData = async (tableName) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/tables/${tableName}`);
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map((row) =>
                    Object.fromEntries(
                        Object.entries(row).map(([key, value]) => [key, formatDate(value)])
                    )
                );
                setTableData(formattedData);
                setFilteredData(formattedData); // Inițial, datele filtrate sunt aceleași cu cele originale
                setSortConfig(null); // Resetăm sortarea
                setSearchField(''); // Resetăm câmpul de căutare
                setSearchTerm(''); // Resetăm termenul de căutare
                setSelectedTable(tableName); // Setează tabelul selectat
                setActiveOption(tableName); // Setează opțiunea activă
            } else {
                console.error('Eroare la obținerea datelor din tabel.');
            }
        } catch (error) {
            console.error('Eroare de rețea:', error);
        }
    };

    const handleSearch = () => {
        if (!searchField || !searchTerm) {
            setFilteredData(tableData); // Dacă nu există căutare, afișăm toate datele
            return;
        }

        const filtered = tableData.filter((row) => {
            const cellValue = row[searchField]?.toString().toLowerCase();
            return cellValue?.includes(searchTerm.toLowerCase());
        });

        setFilteredData(filtered);
    };

    const handleSort = (column) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sorted = [...filteredData].sort((a, b) => {
            if (a[column] < b[column]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setFilteredData(sorted);
        setSortConfig({ key: column, direction });
    };

    const closeModal = () => {
        setModalData({ isOpen: false, content: {} });
    };

    const handleDelete = async (row) => {
        const confirmDelete = window.confirm('Ești sigur că vrei să ștergi această înregistrare și toate datele asociate?');
        if (!confirmDelete) return;
    
        let id;
        // Determinăm ID-ul în funcție de tabelul selectat
        switch (selectedTable) {
            case 'Utilizatori':
                id = row.id_user;
                break;
            case 'Anunturi':
                id = row.id_add;
                break;
            case 'Categorii':
                id = row.id_categorie;
                break;
            case 'Proprietati':
                id = row.id_prop;
                break;
            case 'Imagini':
                id = row.id_imagine;
                break;
            case 'Vizionari':
                id = row.id_vizionare;
                break;
            case 'Recenzii':
                id = row.id_review;
                break;
            default:
                alert('Tabel necunoscut!');
                return;
        }

        //console.log(`Ștergere din tabelul ${selectedTable} pentru ID-ul: ${id}`);

        
        try {
            const response = await fetch(`http://localhost:3000/admin/tables/${selectedTable}/${id}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                // Eliminăm rândul din tabelul local
                const updatedData = filteredData.filter((row) => {
                    switch (selectedTable) {
                        case 'Utilizatori':
                            return row.id_user !== id;
                        case 'Anunturi':
                            return row.id_add !== id;
                        case 'Categorii':
                            return row.id_categorie !== id;
                        case 'Proprietati':
                            return row.id_prop !== id;
                        case 'Imagini':
                            return row.id_imagine !== id;
                        case 'Vizionari':
                            return row.id_vizionare !== id;
                        case 'Recenzii':
                            return row.id_review !== id;
                        default:
                            return row.id !== id;
                    }
                });
                setTableData(updatedData);
                setFilteredData(updatedData);
                alert('Înregistrarea și datele asociate au fost șterse cu succes!');
            } else {
                alert('Eroare la ștergerea înregistrării.');
            }
        } catch (error) {
            console.error('Eroare la ștergere:', error);
            alert('Eroare de rețea. Încearcă din nou.');
        }
    };
    
    const handleEdit = (row) => {
        setModalData({
            isOpen: true,
            content: {...row}, // Transmitem datele rândului pentru editare
        });
    };
    
    
    const handleSaveEdit = async () => {
        try {
            const updatedRow = { ...modalData.content }; // Creează o copie pentru a evita mutații directe
            let id; // Salvează ID-ul înainte de a-l elimina din corp

            // Determinăm ID-ul în funcție de tabelul selectat
            switch (selectedTable) {
                case 'Utilizatori':
                    id = updatedRow.id_user;
                    if(updatedRow.data_inregistrare){
                        updatedRow.data_inregistrare = convertDateToMySQLFormat(updatedRow.data_inregistrare);
                    }
                    break;
                case 'Anunturi':
                    id = updatedRow.id_add;
                    break;
                case 'Categorii':
                    id = updatedRow.id_categorie;
                    break;
                case 'Proprietati':
                    id = updatedRow.id_prop;
                    break;
                case 'Imagini':
                    id = updatedRow.id_imagine;
                    break;
                case 'Vizionari':
                    id = updatedRow.id_vizionare;
                    if(updatedRow.data_vizionare){
                        updatedRow.data_vizionare = convertDateToMySQLFormat(updatedRow.data_vizionare);
                    }
                    break;
                case 'Recenzii':
                    id = updatedRow.id_review;
                    if(updatedRow.data_review){
                        updatedRow.data_review = convertDateToMySQLFormat(updatedRow.data_review);
                    }
                    break;
                default:
                    alert('Tabel necunoscut!');
                    return;
            }
            if(!id){
                alert('ID-ul nu este definit');
                return;
            }

            if (Object.values(updatedRow).some(value => value === '')) {
                alert('Te rugăm să completezi toate câmpurile!');
                return;
            }

            //console.log('Updated Row:', JSON.stringify(updatedRow, null, 2)); // Adăugați acest log pentru a vedea conținutul din updatedRow

            const response = await fetch(`http://localhost:3000/admin/tables/${selectedTable}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRow),
            });

            if (response.ok) {
                const updatedData = tableData.map((row) => row.id === id ? {id, ...updatedRow} : row);
                setTableData(updatedData);
                setFilteredData(updatedData);
                setModalData({ isOpen: false, content: {} });
                alert('Înregistrarea a fost actualizată cu succes!');
            } else {
                const errorData = await response.json();//incercare de afisare a erorilor de backend
                alert(`Eroare la actualizarea datelor: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Eroare la salvarea modificărilor:', error);
            alert('Eroare la salvarea modificărilor.');
        } 
    };
    

    const handleAddRow = () => {
        setIsAddingRow(true); // Deschide formularul de adăugare
        setNewRowData({}); // Resetează datele pentru noul rând
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRowData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveNewRow = async () => {

        if (Object.keys(newRowData).some((key) => !newRowData[key])) {
            alert('Te rugăm să completezi toate câmpurile!');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/admin/tables/${selectedTable}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRowData),
            });

            if (response.ok) {
                // Adăugăm noul rând în tabelul local
                setTableData((prevData) => [...prevData, newRowData]);
                setFilteredData((prevData) => [...prevData, newRowData]);
                setIsAddingRow(false);
                alert('Datele au fost adăugate cu succes!');
            } else {
                alert('Eroare la adăugarea datelor.');
            }
        } catch (error) {
            console.error('Eroare de rețea:', error);
            alert('Eroare de rețea. Încearcă din nou.');
        }
    };

    const handleCancelAddRow = () => {
        setIsAddingRow(false); // Închide formularul de adăugare
    };

    const tables = ['Utilizatori', 'Anunturi', 'Proprietati', 'Imagini', 'Categorii', 'Vizionari', 'Recenzii'];

    return (
        <div className="admin-page">
            <div className="admin-sidebar">
                <div className="admin-user-info">
                    <h2>Bun venit,</h2>
                    <h3>{adminData.prenume}</h3>
                    <p>ID: {adminData.id_user}</p>
                    <p>Email: {adminData.email}</p>
                </div>
                <div className="admin-menu">
                    {tables.map((table) => (
                        <div
                            key={table}
                            className={`menu-item ${activeOption === table ? 'active' : ''}`}
                            onClick={() => fetchTableData(table)}
                        >
                            {table}
                        </div>
                    ))}
                    <div
                        className="menu-item-stats"
                        onClick={() => setShowStats(true)}
                    >
                        Statistici
                    </div>

                    <div
                        className="home-button"
                        onClick={() => {
                            window.location.href = '/';
                        }}
                    >
                        <img src="/home2.png" alt="home2" />
                        Înapoi la Home
                    </div>
                </div>
            </div>
            <div className="admin-content">
                {showStats ? (
                    <div className="stats-container">
                        <h1>Statistici</h1>
                        {/*<p>Numărul total de anunțuri: <b>{numAnunturi}</b></p>
                        <p>Numărul total de utilizatori: <b>{numUtilizatori}</b></p>
                        <p>Numărul total de proprietăți: <b>{numProprietati}</b></p>*/}
                        <div className="stats-container-charts"> {/*se gaseste styling-ul in PieChart.scss*/}
                            <PieChart type="utilizatori-anunturi" /> 
                            <PieChart type="proprietati-categorii" />
                            <PieChart type="statusuri" />
                            <PieChart type="proprietati-orase" />
                        </div>
                        <button className = 'button-stats' onClick={() => setShowStats(false)}>Înapoi</button>
                    </div>
                ) : selectedTable ? (
                    <>
                        <h1>Tabel: {selectedTable}</h1>
                        <button className="button-add-data" onClick={handleAddRow}>Adaugă date</button>

                        {isAddingRow && (
                            <div className="add-row-form">
                                <h2>Adaugă noi date</h2>
                                {Object.keys(tableData[0] || {}).map((key) => (
                                    <div key={key}>
                                        <label>{key}:</label>
                                        <input
                                            type="text"
                                            name={key}
                                            value={newRowData[key] || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                ))}
                                <button onClick={handleSaveNewRow}>Salvează</button>
                                <button onClick={handleCancelAddRow}>Anulează</button>
                            </div>
                        )}


                        {/* Secțiunea de căutare */}
                        <div className="search-container">
                            <select
                                value={searchField}
                                onChange={(e) => setSearchField(e.target.value)}
                            >
                                <option value="">Selectează câmpul</option>
                                {tableData.length > 0 &&
                                    Object.keys(tableData[0]).map((col) => (
                                        <option key={col} value={col}>
                                            {col}
                                        </option>
                                    ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Caută..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button onClick={handleSearch}>Caută</button>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        {filteredData.length > 0 &&
                                            Object.keys(filteredData[0]).map((col) => (
                                                <th key={col} onClick={() => handleSort(col)}>
                                                    {col}
                                                    {sortConfig?.key === col && (
                                                        <span>
                                                            {sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'}
                                                        </span>
                                                    )}
                                                </th>
                                            ))}
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index}>
                                            {Object.keys(row).map((col, idx) => (
                                                <td key={idx} className='table-col-scroll'>{row[col]}</td>
                                            ))}
                                            <td>
                                                <div className="action-buttons">
                                                    <button onClick={() => handleEdit(row)}>Editează</button>
                                                    <button onClick={() => handleDelete(row)}>Șterge</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p>Selectează un tabel din meniul din stânga pentru a vizualiza datele.</p>
                )}
            </div>

            {modalData.isOpen && (
                <div className="edit-modal">
                    <h2>Editează înregistrarea</h2>
                    <form>
                        {Object.keys(modalData.content).map((key) => { 
                            const value = modalData.content[key];
                            return (
                                <div key={key}>
                                    <label>{key}:</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => {
                                            setModalData((prev) => ({
                                                ...prev,
                                                content: {
                                                    ...prev.content,
                                                    [key]: e.target.value,
                                                },
                                            }));
                                        }}
                                    />
                                </div>
                            );
                        })}
                        <button type="button" onClick={handleSaveEdit}>
                            Salvează modificările
                        </button>
                        <button type="button" onClick={closeModal}>
                            Închide
                        </button>
                    </form>
                </div>
             )}

        </div>
    );
};

export default Admin;