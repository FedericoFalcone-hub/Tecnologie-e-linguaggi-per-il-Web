const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const swaggerDocument = require('./swagger.json');

const mongoURL = "mongodb+srv://federicofalcone3105_db_user:IhhFMvTzoFkaoaaZ@fastfood.oohbubt.mongodb.net";
const port = 3005;
const client = new MongoClient(mongoURL);
const app = express()

const bycrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

app.use('/user', checkApiKeys);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function getUser(id) {

    const filter = {_id: ObjectID.createFromHexString(id)};
    return await client.db('FastFood').collection('users').findOne(filter);
}

async function getRistorante(id) {

    const filter = {idRistoratore: id};
    return await client.db('FastFood').collection('ristoranti').findOne(filter);
}

async function getCoordinates(address) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'BizarreBites/1.0 (University project)'
            }
        });
        const data = await response.json();
        if (data.length === 0) {
            return null;
        } else {
            return {lat: data[0].lat, lon: data[0].lon};
        }
    } catch (error) {
        console.log(`Errore durante la verifica dell'indirizzo: ${error}`);
        return null;
    }
}

function checkApiKeys(req, res, next) {
    console.log("Siamo nel middlware");

    if (req.query.api_key === "1234567") {
        console.log(req.query.api_key);

        next();
    } else {
        res.status(401).send("Non autorizzato")
    }


}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateAddress(address) {
    const regex = /^[a-zA-ZÀ-ÿ0-9\s,'-]+$/;
    return address.trim().length > 0 && regex.test(address);
}

app.post('/user', async (req, res) => {
    // #swagger.description = "Crea un nuovo utente"

    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const email = req.body.email;
    const password = req.body.password;
    const ristoratore = req.body.ristoratore;
    const indirizzo = req.body.indirizzo;

    if (!nome || !cognome || !email || !password || !indirizzo) {
        res.status(400).json({error: "Dati mancanti"});
        return;
    }

    if (nome < 2) {
        res.status(401).json({error: "Nome troppo corto"});
        return;
    }
    if (cognome < 2) {
        res.status(401).json({error: "Cognome troppo corto"});
        return;
    }
    if (password < 2) {
        res.status(401).json({error: "Password troppo corta"});
        return;
    }
    if (!validateEmail(email)) {
        res.status(401).json({error: "Email non valida"});
        return;
    }
    if (!validateAddress(indirizzo)) {
        res.status(401).json({error: "Indirizzo non valido"});
        return;
    }

    const coordinates = await getCoordinates(indirizzo);
    if (!coordinates) {
        res.status(400).json({error: "Indirizzo non valido"});
        return;
    }

    const hashedPassword = await bycrypt.hash(password, 10);


    let user_no_psw;
    try {
        const user = {
            nome: nome,
            cognome: cognome,
            email: email,
            indirizzo: indirizzo,
            password: hashedPassword,
            lat: coordinates.lat,
            lon: coordinates.lon,
            ristoratore: ristoratore
        };

        await client.db('FastFood').collection('users').insertOne(user);

        user_no_psw = {...user, password: undefined}


        res.json(user_no_psw);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({error: "Email già in uso"});
        } else {
            res.status(500).json({error: `Errore non gestito ${error.message}`});
        }
    }
});

app.post('/user/login', async (req, res) => {
    // #swagger.description = "Login utente"

    const email = req.body.email;
    const password = req.body.password;

    const user = await client.db('FastFood').collection('users').findOne({email: email});
    if (!user) {
        res.status(404).json({error: "Credenziali non valide"});
        return;
    }
    const isMatch = await bycrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({error: "Credenziali non valide"});
        return;
    }

    let user_no_psw = {...user, password: undefined}
    res.json(user_no_psw);
});

app.get('/user/:id', async (req, res) => {
    // #swagger.description = "Recupera un utente per ID"

    const id = req.params.id;
    const user = await getUser(id);
    if (!user) {
        res.status(404).send("Utente non trovato");
        return;
    }
    res.json(user);
});

app.put('/user/:id', async (req, res) => {
    // #swagger.description = "Aggiorna dati personali utente per ID"

    const id = req.params.id;
    const newNome = req.body.nome;
    const newCognome = req.body.cognome;
    const newEmail = req.body.email;
    const newIndirizzo = req.body.indirizzo;
    if (newNome < 2) {
        res.status(401).json({error: "Nome troppo corto"});
    }
    if (newCognome < 2) {
        res.status(401).json({error: "Cognome troppo corto"});
    }
    if (!validateEmail(newEmail)) {
        res.status(401).json({error: "Email non valida"});
    }
    if (!validateAddress(newIndirizzo)) {
        res.status(401).json({error: "Indirizzo non valido"});
    }

    const coordinates = await getCoordinates(newIndirizzo);
    if (!coordinates) {
        res.status(400).json({error: "Indirizzo non valido"});
        return;
    }

    try {

        const coll = client.db('FastFood').collection('users');
        const result = await coll.updateOne(
            {_id: ObjectID.createFromHexString(id)},
            {
                $set: {
                    nome: newNome,
                    cognome: newCognome,
                    email: newEmail,
                    indirizzo: newIndirizzo,
                    lat: coordinates.lat,
                    lon: coordinates.lon
                }
            });
        res.json(result);

    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({error: "Email già in uso"});
        } else {
            res.status(500).json({error: error.message});
        }
    }

});

app.put('/user/:id/password', async (req, res) => {
    // #swagger.description = "Aggiorna password utente per ID"

    const id = req.params.id;
    const newPassword = req.body.password;
    const currentPassword = req.body.passwordAttuale;

    if (!newPassword || !currentPassword) {
        return res.status(400).json({error: "Dati mancanti"});
    }
    if (newPassword.length < 2) {
        return res.status(400).json({error: "Password troppo corta"});
    }


    const coll = client.db('FastFood').collection('users');
    const user = await getUser(id);

    if (!user) {

        return res.status(404).json({error: "Utente non trovato"});
    }

    const passwordCorretta = await bycrypt.compare(currentPassword, user.password);
    if (!passwordCorretta) {

        return res.status(401).json({error: "Password attuale non corretta"});
    }
    const hashedPassword = await bycrypt.hash(newPassword, 10);

    const result = await coll.updateOne(
        {_id: ObjectID.createFromHexString(id)},
        {
            $set: {
                password: hashedPassword
            }
        });
    res.json(result);

});

app.delete('/user/:id', async (req, res) => {
    // #swagger.description = "Elimina un utente per ID"

    const id = req.params.id;

    const result = await client.db('FastFood')
        .collection('users')
        .deleteOne({_id: ObjectID.createFromHexString(id)});

    res.json(result);
});

app.post('/user/:id/ristorante', async (req, res) => {
    // #swagger.description = "Registra un ristorante per un utente"

    const id = req.params.id;
    const nomeRistorante = req.body.nomeRistorante;
    const partitaIVA = req.body.partitaIVA;
    const telefonoRistorante = req.body.telefonoRistorante;
    const indirizzoRistorante = req.body.indirizzoRistorante;

    if (!nomeRistorante || !partitaIVA || !telefonoRistorante || !indirizzoRistorante) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    if (!validateAddress(indirizzoRistorante)) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const coordinates = await getCoordinates(indirizzoRistorante);
    if (!coordinates) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }


    try {
        const risorante = {
            nomeRistorante: nomeRistorante,
            partitaIVA: partitaIVA,
            idRistoratore: id,
            telefonoRistorante: telefonoRistorante,
            indirizzoRistorante: indirizzoRistorante,
            lat: coordinates.lat,
            lon: coordinates.lon,
            logoUrl: null
        };
        await client.db('FastFood').collection('ristoranti').insertOne(risorante);


        res.json(risorante);
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.partitaIVA) {
                res.status(409).json({error: "Partita IVA già registrata"});
            } else {
                res.status(409).json({error: "Ristorante già registrato per questo utente"});
            }
        } else {
            res.status(500).json({error: `Errore non gestito ${error.message}`});
        }
    }

});

app.get('/user/:id/ristorante', async (req, res) => {
    // #swagger.description = "Recupera il ristorante di un utente"

    const id = req.params.id;
    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }


    const ristorante = await client.db('FastFood').collection('ristoranti').findOne({idRistoratore: id});

    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    res.json(ristorante);
});

app.put('/user/:id/ristorante/logo', async (req, res) => {
    // #swagger.description = "Aggiorna il logo del ristorante di un utente"
    const id = req.params.id;
    let logoUrl = req.body.logoUrl;

    if (!logoUrl) {
        logoUrl = "";
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    if (!await getRistorante(id)) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }


    const result = await client.db('FastFood').collection('ristoranti').updateOne(
        {idRistoratore: id},
        {$set: {logoUrl: logoUrl}}
    );

    res.json(result);
});

app.put('/user/:id/ristorante', async (req, res) => {
    // #swagger.description = "Aggiorna i dati del ristorante di un utente"

    const id = req.params.id;
    const newNomeRistorante = req.body.nomeRistorante;
    const newPartitaIVA = req.body.partitaIVA;
    const newTelefonoRistorante = req.body.telefonoRistorante;
    const newIndirizzoRistorante = req.body.indirizzoRistorante;

    if (!newNomeRistorante || !newPartitaIVA || !newTelefonoRistorante || !newIndirizzoRistorante) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    if (!validateAddress(newIndirizzoRistorante)) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }

    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistorante(id);

    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    const coordinates = await getCoordinates(newIndirizzoRistorante);
    if (!coordinates) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }


    const datiModificati = {
        nomeRistorante: newNomeRistorante,
        partitaIVA: newPartitaIVA,
        telefonoRistorante: newTelefonoRistorante,
        indirizzoRistorante: newIndirizzoRistorante,
        lat: coordinates.lat,
        lon: coordinates.lon
    }
    try {
        await client.db('FastFood').collection('ristoranti').updateOne(
            {idRistoratore: id},
            {
                $set: {
                    nomeRistorante: newNomeRistorante,
                    partitaIVA: newPartitaIVA,
                    telefonoRistorante: newTelefonoRistorante,
                    indirizzoRistorante: newIndirizzoRistorante,
                    lat: coordinates.lat,
                    lon: coordinates.lon
                }
            }
        );


        res.json(datiModificati);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({error: "Partita IVA già registrata"});
        } else {
            res.status(500).json({error: `Errore non gestito ${error.message}`});
        }
    }
});

app.delete('/user/:id/ristorante', async (req, res) => {
    // #swagger.description = "elimina ristorante"
    const id = req.params.id;
    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistorante(id);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }


    const result = await client.db('FastFood').collection('ristoranti').deleteOne({idRistoratore: id});


    res.json(result);
});
app.get('/piatti', async (req, res) => {
    // #swagger.description = "Recupera i piatti presenti nel catalogo"

    const piatti = await client.db('FastFood').collection('catalogo').find({}).toArray();

    res.json(piatti);
});

app.get('/ristorante/:id/menu', async (req, res) => {
    // #swagger.description = "Recupera il menu"
    const id = ObjectID.createFromHexString(req.params.id);


    const menuDettagliato = await client.db('FastFood').collection('menu').aggregate([

        {$match: {idRistorante: id}},
        {
            $lookup: {
                from: 'catalogo',
                let: {idProdottoStr: '$idProdotto'},
                pipeline: [
                    {$match: {$expr: {$eq: ['$_id', {$toObjectId: '$$idProdottoStr'}]}}}
                ],
                as: 'dettagli'
            }
        },
        {
            $addFields: {
                nome: {$ifNull: [{$arrayElemAt: ['$dettagli.strMeal', 0]}, '$nome']},
                foto: {$ifNull: [{$arrayElemAt: ['$dettagli.strMealThumb', 0]}, '$foto']},
                categoria: {$ifNull: [{$arrayElemAt: ['$dettagli.strCategory', 0]}, '$categoria']}
            }
        },
        {
            $project: {
                _id: 1, prezzo: 1, nome: 1, foto: 1, categoria: 1, ingredienti: 1, personalizzato: 1, idProdotto: 1
            }
        }
    ]).toArray();


    res.json(menuDettagliato);
});

app.post('/ristorante/:id/menu', async (req, res) => {
    // #swagger.description = Aggiunge un prodotto presente nel catalogo al menu del ristorante dell'utente
    const idUtente = req.params.id;
    const idProdotto = req.body.idProdotto;
    const prezzo = req.body.prezzo;

    const user = await getUser(idUtente);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistorante(idUtente);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    if (!prezzo || isNaN(prezzo) || prezzo <= 0) {
        return res.status(400).json({error: "Prezzo non valido"});
    }


    const piattoCatalogo = await client.db('FastFood').collection('catalogo').findOne({_id: ObjectID.createFromHexString(idProdotto)});
    const result = await client.db('FastFood').collection('menu').insertOne({
        idRistorante: ristorante._id,
        nome: piattoCatalogo.strMeal,
        prezzo: prezzo,
        ingredienti: piattoCatalogo.ingredients,
        categoria: piattoCatalogo.strCategory,
        foto: piattoCatalogo.strMealThumb
    });


    res.json(result);
});

app.delete('/ristorante/:id/menu', async (req, res) => {
    // #swagger.description = Rimuove un prodotto dal menu del ristorante dell'utente
    const idUtente = req.params.id;
    const idMenu = req.body.id;

    let user = await getUser(idUtente);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistorante(idUtente);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }


    const result = await client.db('FastFood').collection('menu').deleteOne({_id: ObjectID.createFromHexString(idMenu)});

    res.json(result);
});

app.get('/categorie', async (req, res) => {

    const result = await client.db('FastFood').collection('catalogo').distinct('strCategory');

    res.json(result);
})

app.put('/ristorante/:id_user/menu/:id_prodotto', async (req, res) => {
    // #swagger.description = Aggiorna i dati di un prodotto nel menu del ristorante dell'utente
    const idUtente = req.params.id_user;
    const idProdotto = req.params.id_prodotto;
    const newPrezzo = req.body.prezzo;
    const newIngredienti = req.body.ingredienti;
    const newCategoria = req.body.categoria;
    const newNome = req.body.nome;
    const newFoto = req.body.foto;

    const user = await getUser(idUtente);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistorante(idUtente);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    if (!newPrezzo || isNaN(newPrezzo) || newPrezzo <= 0) {
        return res.status(400).json({error: "Prezzo non valido"});
    }

    const result = await client.db('FastFood').collection('menu').updateOne(
        {_id: ObjectID.createFromHexString(idProdotto)},
        {
            $set: {
                prezzo: newPrezzo,
                ingredienti: newIngredienti,
                categoria: newCategoria,
                nome: newNome,
                foto: newFoto
            }
        }
    );

    res.json(result);

})

client.connect()
    .then(() => {
        app.listen(port, () => console.log(`Server avviato sulla porta ${port}`));
    })
    .catch(err => console.error('Errore connessione MongoDB:', err));
