// Importă modulele necesare
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Folosim bcrypt pentru a verifica parola
const { createConnection } = require('mysql2');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configurări pentru aplicație
const app = express();
const port = 3000;

app.use(cors()); // Permite cererile din alte domenii
app.use(express.json()); // Permite citirea datelor JSON

// Configurația conexiunii la baza de date MySQL
const dbConfig = {
    host: '127.0.0.1', // Adresa serverului MySQL
    port: 3306, // Portul MySQL
    user: 'calin', // Numele utilizatorului MySQL
    password: 'CalinCosmin100!', // Parola utilizatorului MySQL
    database: 'Anunturi_imobiliare', // Numele bazei de date
};

// Endpoint pentru preluarea datelor de signup
app.post('/signup', async (req, res) => {
    const { nume, prenume, email, telefon, parola, tip_utilizator } = req.body;

    try {
        // Hash parola înainte de a o salva
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parola, salt);

        const connection = await mysql.createConnection(dbConfig);

        const query = `
            INSERT INTO Utilizatori (nume, prenume, email, parola, tip_utilizator, nr_telefon)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [nume, prenume, email, hashedPassword, tip_utilizator, telefon || null];

        await connection.execute(query, values);
        await connection.end();

        res.status(200).json({ message: 'Înregistrare realizată cu succes!' });
    } catch (error) {
        console.error('Eroare la înregistrare:', error);
        res.status(500).json({ error: 'A apărut o eroare la înregistrare.' });
    }
});


// Endpoint pentru preluarea datelor de login
app.post('/login', async (req, res) => {
    const { email, parola } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute('SELECT * FROM Utilizatori WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Utilizatorul nu există!' });
        }

        const user = rows[0];

        // Compară parola introdusă cu parola hashată
        const isMatch = await bcrypt.compare(parola, user.parola);

        if (!isMatch) {
            return res.status(401).json({ error: 'Parola este incorectă!' });
        }

        res.status(200).json({ message: 'Autentificare reușită!' });
    } catch (error) {
        console.error('Eroare la autentificare:', error);
        res.status(500).json({ error: 'A apărut o eroare la autentificare.' });
    }
});

// endpoint pentru preluarea datelor de profil pe baza adresei de email
app.get('/profile', async (req, res) => {
    const { email } = req.query; // Extract email from query parameters

    try {
        //console.log("Email:", email); // Debug the received email
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT id_user, nume, prenume, email, parola, tip_utilizator, nr_telefon, data_inregistrare FROM Utilizatori WHERE email = ?;',
            [email]
        );
        //console.log(rows);
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Return the user data
        } else {
            res.status(404).json({ message: 'User not found' });
        }

        await connection.end();
    } catch (error) {
        console.error('Error fetching user data', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint pentru actualizarea datelor de profil (nr_telefon)
app.put('/profile/update-phone', async (req, res) => {
    const { email, nr_telefon } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const query = `
            UPDATE Utilizatori
            SET nr_telefon = ?
            WHERE email = ?
        `;
        const [result] = await connection.execute(query, [nr_telefon, email]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Numărul de telefon a fost actualizat cu succes.' });
        } else {
            res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
        }

        await connection.end();
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Eroare internă de server. Te rugăm să încerci din nou.' });
    }
});

// endpoint pentru preluarea anunturilor pe baza adresei de email
app.get('/profile/ads', async (req, res) => {
    const { email } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Obține ID-ul utilizatorului pe baza email-ului
        const [userRows] = await connection.execute(
            'SELECT id_user FROM Utilizatori WHERE email = ?;',
            [email]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
        }

        const userId = userRows[0].id_user;

        // Interoghează datele despre anunțuri
        const [adsRows] = await connection.execute(`
            SELECT 
                A.id_add, A.titlu, A.descriere, A.pret, A.status,
                P.suprafata, P.nr_camere, P.adresa, P.an_constructie,
                C.denumire AS categorie, C.descriere AS descriere_categorie,
                I.url AS imagine
            FROM Anunturi A
            JOIN Proprietati P ON A.id_add = P.id_add
            JOIN Categorii C ON P.id_categorie = C.id_categorie
            LEFT JOIN Imagini I ON P.id_prop = I.id_prop
            WHERE A.id_user = ?
        `, [userId]);

        res.status(200).json(adsRows);
        await connection.end();
    } catch (error) {
        console.error('Eroare la preluarea anunțurilor:', error);
        res.status(500).json({ message: 'Eroare internă de server.' });
    }
});

// endpoint pentru actualizarea anuntului
app.put('/profile/ads/:id', async (req, res) => {
    const adId = req.params.id; // ID-ul anunțului
    const { 
        titlu, descriere, pret, status, adresa, categorie, nr_camere, suprafata, an_constructie, imagine 
    } = req.body; // Date primite de la client

    // Lista valorilor permise pentru `status`
    const validStatuses = ['cumparare', 'inchiriere', 'cumparat', 'inchiriat', 'rezervat'];

    // Validare `status`
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Statusul "${status}" nu este valid.` });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Actualizare în tabelul `Anunturi`
        const updateAnunturiQuery = `
            UPDATE Anunturi 
            SET titlu = ?, descriere = ?, pret = ?, status = ?
            WHERE id_add = ?
        `;
        await connection.execute(updateAnunturiQuery, [titlu, descriere, pret, status, adId]);

        // Actualizare în tabelul `Proprietati`
        const updateProprietatiQuery = `
            UPDATE Proprietati
            SET adresa = ?, id_categorie = ?, nr_camere = ?, suprafata = ?, an_constructie = ?
            WHERE id_add = ?
        `;
        await connection.execute(updateProprietatiQuery, [adresa, categorie, nr_camere, suprafata, an_constructie, adId]);

        // Actualizare în tabelul `Imagini`
        const updateImaginiQuery = `
            UPDATE Imagini
            SET url = ?
            WHERE id_prop = (SELECT id_prop FROM Proprietati WHERE id_add = ? LIMIT 1)
        `;
        await connection.execute(updateImaginiQuery, [imagine, adId]);

        res.status(200).json({ message: 'Anunțul a fost actualizat cu succes!' });
        await connection.end();
    } catch (error) {
        console.error('Eroare la actualizarea anunțului:', error);
        res.status(500).json({ message: 'Eroare la actualizarea anunțului.' });
    }
});

// endpoint pentru ștergerea anunțului
app.delete('/profile/ads/:id', async (req, res) => {
    const adId = req.params.id; // ID-ul anunțului care trebuie șters

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Ștergere în tabelul `Imagini`
        const deleteImaginiQuery = `
            DELETE FROM Imagini
            WHERE id_prop = (SELECT id_prop FROM Proprietati WHERE id_add = ?)
        `;
        await connection.execute(deleteImaginiQuery, [adId]);

        // Ștergere în tabelul `Proprietati`
        const deleteProprietatiQuery = `
            DELETE FROM Proprietati
            WHERE id_add = ?
        `;
        await connection.execute(deleteProprietatiQuery, [adId]);

        // Ștergere în tabelul `Anunturi`
        const deleteAnunturiQuery = `
            DELETE FROM Anunturi
            WHERE id_add = ?
        `;
        const [resultAnunturi] = await connection.execute(deleteAnunturiQuery, [adId]);

        if (resultAnunturi.affectedRows > 0) {
            res.status(200).json({ message: 'Anunțul și datele asociate au fost șterse cu succes!' });
        } else {
            res.status(404).json({ message: 'Anunțul nu a fost găsit.' });
        }

        await connection.end();
    } catch (error) {
        console.error('Eroare la ștergerea anunțului:', error);
        res.status(500).json({ message: 'Eroare la ștergerea anunțului.' });
    }
});

// endpoint pentru adăugarea unui anunț...
app.post('/profile/ads', async (req, res) => {
    const {
        titlu, descriere, pret, adresa, categorie, nr_camere, suprafata, an_constructie, imagine, email
    } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Găsește ID-ul utilizatorului pe baza email-ului
        const [userRows] = await connection.execute(
            'SELECT id_user FROM Utilizatori WHERE email = ?',
            [email]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
        }

        const userId = userRows[0].id_user;

        // Inserează anunțul în tabelul `Anunturi`
        const insertAnuntQuery = `
            INSERT INTO Anunturi (titlu, descriere, pret, status, id_user)
            VALUES (?, ?, ?, 'cumparare', ?)
        `;
        const [anuntResult] = await connection.execute(insertAnuntQuery, [titlu, descriere, pret, userId]);
        const adId = anuntResult.insertId;

        // Inserează proprietatea în tabelul `Proprietati`
        const insertProprietateQuery = `
            INSERT INTO Proprietati (adresa, id_categorie, nr_camere, suprafata, an_constructie, id_add)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(insertProprietateQuery, [adresa, categorie, nr_camere, suprafata, an_constructie, adId]);

        // Inserează imaginea în tabelul `Imagini`
        const insertImagineQuery = `
            INSERT INTO Imagini (url, id_prop)
            VALUES (?, (SELECT id_prop FROM Proprietati WHERE id_add = ? LIMIT 1))
        `;
        await connection.execute(insertImagineQuery, [imagine, adId]);

        res.status(201).json({ id_add: adId, titlu, descriere, pret, adresa, categorie, nr_camere, suprafata, an_constructie, imagine, status: 'cumparare' });

        await connection.end();
    } catch (error) {
        console.error('Eroare la adăugarea anunțului:', error);
        res.status(500).json({ message: 'Eroare la adăugarea anunțului.' });
    }
});

// Funcție pentru a obține coordonatele pe baza adresei
async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            };
        }
        return null; // Dacă nu se găsește adresa
    } catch (error) {
        console.error('Error during geocoding:', error);
        return null;
    }
}

// Endpoint pentru preluarea proprietăților
app.get('/properties', async (req, res) => {
    const { location, type, minPrice, maxPrice, bedroom, property, status } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);

        let query = `
            SELECT 
                A.id_add AS id,
                A.titlu AS title,
                A.descriere AS description,
                A.pret AS price,
                A.status AS status,
                P.adresa AS address,
                P.nr_camere AS bedroom,
                P.suprafata AS surface,
                P.an_constructie AS year,
                C.denumire AS category,
                I.url AS img
            FROM Anunturi A
            JOIN Proprietati P ON A.id_add = P.id_add
            JOIN Categorii C ON P.id_categorie = C.id_categorie
            LEFT JOIN Imagini I ON P.id_prop = I.id_prop
        `;

        const conditions = [];
        const values = [];

        if (type) {
            conditions.push(`C.denumire = ?`);
            values.push(type);
        }

        if(status) {
            conditions.push(`A.status = ?`);
            values.push(status);
        }

        if (location) {
            conditions.push(`P.adresa LIKE ?`);
            values.push(`%${location}%`);
        }

        if (property) {
            conditions.push(`P.id_categorie = ?`); // Filtrare după categorie
            values.push(property);
        }

        if (minPrice) {
            conditions.push(`A.pret >= ?`);
            values.push(minPrice);
        }

        if (maxPrice) {
            conditions.push(`A.pret <= ?`);
            values.push(maxPrice);
        }

        if (bedroom) {
            conditions.push(`P.nr_camere = ?`);
            values.push(bedroom);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const [rows] = await connection.execute(query, values);
        await connection.end();

        // Geocodează fiecare proprietate
        const propertiesWithCoords = await Promise.all(
            rows.map(async (property) => {
                const coords = await geocodeAddress(property.address);
                return {
                    ...property,
                    lat: coords ? coords.lat : null,
                    lon: coords ? coords.lon : null,
                };
            })
        );

        res.status(200).json(propertiesWithCoords);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error while fetching properties' });
    }
});

// Endpoint pentru preluarea detaliilor unei proprietăți
app.get('/properties/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const query = `
            SELECT 
                A.id_add AS id,
                A.titlu AS title,
                A.descriere AS description,
                A.pret AS price,
                A.status AS status,
                P.adresa AS address,
                P.nr_camere AS bedroom,
                P.suprafata AS surface,
                P.an_constructie AS year,
                C.denumire AS category,
                C.descriere AS category_description,
                I.url AS img
            FROM Anunturi A
            JOIN Proprietati P ON A.id_add = P.id_add
            JOIN Categorii C ON P.id_categorie = C.id_categorie
            LEFT JOIN Imagini I ON P.id_prop = I.id_prop
            WHERE A.id_add = ?
        `;

        const [rows] = await connection.execute(query, [id]);
        await connection.end();

        if (rows.length > 0) {
            res.status(200).json(rows[0]); // Returnăm doar primul rând, deoarece ID-ul este unic
        } else {
            res.status(404).json({ message: 'Proprietatea nu a fost găsită.' });
        }
    } catch (error) {
        console.error('Error fetching property details:', error);
        res.status(500).json({ message: 'Server error while fetching property details' });
    }
});

// Endpoint pentru preluarea recenziilor unei proprietăți
app.get('/properties/:id/reviews', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const query = `
            SELECT 
                R.text AS text,
                R.rating,
                R.data_review AS date,
                U.prenume AS user_name
            FROM Recenzii R
            JOIN Utilizatori U ON R.id_user = U.id_user
            WHERE R.id_add = ?
            ORDER BY R.data_review DESC
        `;

        const [rows] = await connection.execute(query, [id]);
        await connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
});

// Endpoint pentru adăugarea unei recenzii
app.post('/properties/:id/reviews', async (req, res) => {
    const { id } = req.params; // id_add din URL
    const { id_user, text, rating } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Verifică dacă utilizatorul există
        const [userRows] = await connection.execute('SELECT id_user FROM Utilizatori WHERE id_user = ?', [id_user]);
        if (userRows.length === 0) {
            return res.status(400).json({ message: 'Utilizatorul nu există.' });
        }

        // Verifică dacă anunțul există
        const [adRows] = await connection.execute('SELECT id_add FROM Anunturi WHERE id_add = ?', [id]);
        if (adRows.length === 0) {
            return res.status(400).json({ message: 'Anunțul nu există.' });
        }

        // Inserează recenzia
        const query = `
            INSERT INTO Recenzii (id_user, id_add, text, rating, data_review)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const values = [id_user, id, text, rating];
        await connection.execute(query, values);

        res.status(201).json({ message: 'Recenzia a fost adăugată cu succes!' });
        await connection.end();
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'A apărut o eroare la adăugarea recenziei.' });
    }
});

// Endpoint pentru preluarea utilizatorilor
app.get('/users', async (req, res) => {
    const { email } = req.query;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id_user FROM Utilizatori WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        }

        res.status(200).json(rows[0]);
        await connection.end();
    } catch (error) {
        console.error('Eroare la preluarea utilizatorului:', error);
        res.status(500).json({ error: 'Eroare la preluarea utilizatorului.' });
    }
});

// Endpoint pentru programarea vizionării
app.post('/properties/:id/visits', async (req, res) => {
    const { id } = req.params;  // ID-ul proprietății din URL
    const { id_user, data_vizionare, id_prop } = req.body;  // Datele din body (id_user, data_vizionare, id_prop)

    // Validare pentru id_prop și data_vizionare
    if (!id_user || !data_vizionare || !id_prop) {
        return res.status(400).json({ message: "Datele sunt incomplete. Te rugăm să verifici datele." });
    }

    // Verificăm dacă id_prop corespunde id-ului proprietății
    if (parseInt(id_prop) !== parseInt(id)) {
        console.log("ID-Prop:", id_prop);
        console.log("ParseInt ID-Prop:", parseInt(id_prop));
        console.log("ID from URL:", id);
        console.log("ParseInt ID from URL:", parseInt(id));
        return res.status(400).json({ message: "ID-ul proprietății nu se potrivește cu cel din URL." });
    }

    try {

        const connection = await mysql.createConnection(dbConfig);

        // Înregistrăm vizionarea în baza de date
        const query = `
            INSERT INTO Vizionari (id_user, id_prop, data_vizionare)
            VALUES (?, ?, ?);
        `;
        await connection.execute(query, [id_user, id_prop, data_vizionare]);
        res.status(200).json({ message: 'Vizionarea a fost programată cu succes.' });
    } catch (error) {
        console.error("Error scheduling visit:", error);
        res.status(500).json({ message: 'A apărut o eroare la programarea vizionării.' });
    }
});

// Endpoint pentru preluarea vizionărilor programate...
app.get('/profile/visits', async (req, res) => {
    const email = req.query.email; // obține email-ul din query string

    try {
        const connection = await mysql.createConnection(dbConfig);

        const query = `
            SELECT 
                v.id_vizionare, 
                v.data_vizionare, 
                a.titlu AS proprietate_titlu
            FROM Vizionari v
            JOIN Proprietati p ON v.id_prop = p.id_prop
            JOIN Anunturi a ON p.id_add = a.id_add
            WHERE v.id_user = (SELECT id_user FROM Utilizatori WHERE email = ?)
        `;
        const [results] = await connection.execute(query, [email]);

        //console.log("Rezultate interogare vizionări:", results);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json([]); // Nu sunt vizionări programate
        }
    } catch (error) {
        console.error('Error fetching scheduled visits:', error);
        res.status(500).json({ message: 'A apărut o eroare la obținerea vizionărilor.' });
    }
});

// Endpoint pentru a obține tipul utilizatorului
app.get('/user/type', async (req, res) => {
    const { email } = req.query; // Email-ul este primit ca parametru de interogare

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT tip_utilizator FROM Utilizatori WHERE email = ?;',
            [email]
        );

        if (rows.length > 0) {
            res.status(200).json({ tip_utilizator: rows[0].tip_utilizator }); // Returnăm tipul utilizatorului
        } else {
            res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
        }

        await connection.end();
    } catch (error) {
        console.error('Eroare la obținerea tipului utilizatorului:', error);
        res.status(500).json({ message: 'Eroare internă de server.' });
    }
});

// Endpoint pentru a obține toate tabelele din baza de date
app.get('/admin/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;

    // Lista tabelelor permise (pentru securitate)
    const allowedTables = ['Utilizatori', 'Anunturi', 'Proprietati', 'Imagini', 'Categorii', 'Vizionari', 'Recenzii'];

    if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Tabel invalid.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
        await connection.end();

        res.status(200).json(rows);
    } catch (error) {
        console.error(`Eroare la obținerea datelor din tabelul ${tableName}:`, error);
        res.status(500).json({ error: 'Eroare la obținerea datelor.' });
    }
});

// Endpoint pentru adăugarea datelor într-un tabel de catre admin
app.post('/admin/tables/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    const newRow = req.body;
    
    // Verificăm dacă datele sunt valide
    if (!newRow || Object.keys(newRow).length === 0) {
      return res.status(400).json({ message: 'Datele sunt invalide.' });
    }
  
    try {
        const connection = await mysql.createConnection(dbConfig);

        if(tableName === 'Utilizatori' && newRow.parola) {
            const saltRounds = 10;
            newRow.parola = await bcrypt.hash(newRow.parola, saltRounds);
        }
    
        // Construim query-ul pentru inserare
        const columns = Object.keys(newRow).join(', ');
        const placeholders = Object.keys(newRow).map(() => '?').join(', '); // Folosim "?" pentru parametrii
        const values = Object.values(newRow);
    
        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
        // Executăm query-ul cu parametrii pentru protecție împotriva SQL injection
        const [results] = await connection.execute(query, values);
    
        connection.end();
    
        return res.status(200).json({ message: 'Datele au fost adăugate cu succes!', results });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Eroare la inserarea datelor.', error: err.message });
    }
});

// Endpoint pentru actualizarea datelor într-un tabel de către admin
app.put('/admin/tables/:tableName/:id', async (req, res) => {
    const tableName = req.params.tableName;
    const id = req.params.id; // Record ID
    const updatedData = req.body; // The updated data from the frontend

    //console.log('Updated Data:', updatedData);
    //console.log('ID:', id);

    // Validate the data
    if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ message: 'Datele sunt invalide.' });
    }

    // Determine the correct foreign key column
    let foreignKeyColumn = 'id_user'; // Default to 'id_user' (could be updated for each table)
    let conditionColumn = 'id_user'; // Default condition (could be updated based on table)

    // Adjust foreign key column based on the table
    if(tableName === 'Utilizatori'){
        conditionColumn = 'id_user';
    } else if (tableName === 'Anunturi') {
        foreignKeyColumn = 'id_user';
        conditionColumn = 'id_add'; // 'id_add' for Anunturi
    } else if (tableName === 'Imagini') {
        foreignKeyColumn = 'id_prop';
        conditionColumn = 'id_imagine'; // 'id_imagine' for Imagini
    } else if (tableName === 'Proprietati') {
        foreignKeyColumn = 'id_add'; 
        conditionColumn = 'id_prop'; // 'id_prop' for Proprietati
    } else if (tableName === 'Recenzii') {
        foreignKeyColumn = 'id_user';
        conditionColumn = 'id_review'; // 'id_review' for Recenzii
    } else if (tableName === 'Vizionari') {
        foreignKeyColumn = 'id_user';
        conditionColumn = 'id_vizionare'; // 'id_vizionare' for Vizionari
    } else if (tableName === 'Categorii') {
        conditionColumn = 'id_categorie'; // 'id_categorie' for Categorii
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Construim query-ul pentru actualizare
        const columns = Object.keys(updatedData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updatedData), id]; // Adăugăm `id` la final pentru clauza WHERE

        const query = `UPDATE ${tableName} SET ${columns} WHERE ${conditionColumn} = ?`;

        // Executăm query-ul cu parametrii pentru protecție împotriva SQL injection
        const [results] = await connection.execute(query, values);

        connection.end();

        return res.status(200).json({ message: 'Datele au fost actualizate cu succes!', results });
    } catch (err) {
        console.error('Eroare la actualizare:', err);
        return res.status(500).json({ message: 'Eroare la actualizarea datelor.', error: err.message });
    }
});

// Endpoint pentru ștergerea unei înregistrări și a datelor asociate de catre un admin
app.delete('/admin/tables/:tableName/:id', async (req, res) => {
    const { tableName, id } = req.params;

    // Adăugați acest log pentru a vedea valoarea ID-ului în consola backend-ului
    console.log(`Ștergere din tabelul ${tableName} pentru ID-ul: ${id}`);

    try {
        const connection = await mysql.createConnection(dbConfig);

        switch (tableName) {
            case 'Utilizatori':
                // Ștergem toate datele corelate cu utilizatorul
                await connection.execute('DELETE FROM Anunturi WHERE id_user = ?', [id]);
                await connection.execute('DELETE FROM Vizionari WHERE id_user = ?', [id]);
                await connection.execute('DELETE FROM Recenzii WHERE id_user = ?', [id]);
                await connection.execute('DELETE FROM Utilizatori WHERE id_user = ?', [id]);
                break;
            case 'Anunturi':
                // Ștergem toate datele corelate cu anunțul
                await connection.execute('DELETE FROM Imagini WHERE id_prop IN (SELECT id_prop FROM Proprietati WHERE id_add = ?)', [id]);
                await connection.execute('DELETE FROM Vizionari WHERE id_prop IN (SELECT id_prop FROM Proprietati WHERE id_add = ?)', [id]);
                await connection.execute('DELETE FROM Proprietati WHERE id_prop IN (SELECT id_prop FROM Anunturi WHERE id_add = ?', [id]);
                await connection.execute('DELETE FROM Anunturi WHERE id_add = ?', [id]);
                break;
            case 'Categorii':
                await connection.execute('DELETE FROM Categorii WHERE id_categorie = ?', [id]);
                break;
            case 'Proprietati':
                // Ștergem toate datele corelate cu proprietatea
                await connection.execute('DELETE FROM Imagini WHERE id_prop = ?', [id]);
                await connection.execute('DELETE FROM Vizionari WHERE id_prop = ?', [id]);
                await connection.execute('DELETE FROM Anunturi WHERE id_prop = ?', [id]);
                await connection.execute('DELETE FROM Proprietati WHERE id_prop = ?', [id]);
                break;
            case 'Imagini':
                await connection.execute('DELETE FROM Imagini WHERE id_imagine = ?', [id]);
                break;
            case 'Vizionari':
                await connection.execute('DELETE FROM Vizionari WHERE id_vizionare = ?', [id]);
                break;
            case 'Recenzii':
                await connection.execute('DELETE FROM Recenzii WHERE id_review = ?', [id]);
                break;
            default:
                return res.status(400).json({ message: 'Tabel necunoscut!' });
        }

        await connection.end();

        res.status(200).json({ message: 'Înregistrarea și datele asociate au fost șterse cu succes!' });
    } catch (error) {
        console.error('Eroare la ștergerea înregistrării și datelor asociate:', error);
        res.status(500).json({ message: 'Eroare la ștergerea înregistrării și datelor asociate.' });
    }
});


// Endpoint pentru a obține diverse statistici
app.get('/admin/stats', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [anunturiResult] = await connection.execute('SELECT COUNT(*) AS numAnunturi FROM Anunturi');
        const [utilizatoriResult] = await connection.execute('SELECT COUNT(*) AS numUtilizatori FROM Utilizatori');
        const [proprietatiResult] = await connection.execute('SELECT COUNT(*) AS numProprietati FROM Proprietati');
        const [categoriiResult] = await connection.execute(`
            SELECT C.denumire, COUNT(P.id_prop) AS numProprietati
            FROM Proprietati P
            JOIN Categorii C ON P.id_categorie = C.id_categorie
            GROUP BY C.denumire
        `);
        const [statusuriResult] = await connection.execute(`
            SELECT status, COUNT(*) AS numStatusuri
            FROM Anunturi
            GROUP BY status
        `);
        
        const [oraseResult] = await connection.execute(`
            SELECT SUBSTRING_INDEX(adresa, ',', +1) AS oras, COUNT(*) AS numProprietati
            FROM Proprietati
            GROUP BY oras
        `);
        

        const numAnunturi = anunturiResult[0].numAnunturi;
        const numUtilizatori = utilizatoriResult[0].numUtilizatori;
        const numProprietati = proprietatiResult[0].numProprietati;
        

        await connection.end();

        res.json({ numAnunturi, numUtilizatori, numProprietati, categorii: categoriiResult, statusuri: statusuriResult, orase: oraseResult});
    } catch (error) {
        console.error('Eroare la obținerea statisticilor:', error);
        res.status(500).json({ message: 'Eroare la obținerea statisticilor' });
    }
});

// Pornirea serverului
app.listen(port, () => {
    console.log(`Serverul rulează la adresa http://localhost:${port}`);
});
