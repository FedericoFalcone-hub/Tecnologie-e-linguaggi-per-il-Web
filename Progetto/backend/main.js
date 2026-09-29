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
const {ObjectId} = require("mongodb");

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

async function getIndirizzo(input, predefinito) {
    if (!input || typeof input !== 'object') return {error: "Indirizzo mancante"};
    const via = String(input.via || "").trim();
    const citta = String(input.citta || "").trim();
    const provincia = String(input.provincia || "").trim();
    const cap = String(input.cap || "").trim();
    const civico = String(input.civico || "").trim();

    if (via.length < 2) return {error: "Via non valida"};
    if (!civico || civico.length > 10) return {error: "Civico non valido"};
    if (citta.length < 2) return {error: "Città non valida"};
    if (provincia.length !== 2) return {error: "Provincia non valida"};
    if (!/^\d{5}$/.test(cap)) return {error: "CAP non valido"};

    const coordinates = await getCoordinates(`${via} ${civico}, ${cap} ${citta} (${provincia})`);
    if (!coordinates) return {error: "Indirizzo non valido"};

    return {
        indirizzo: {
            _id: new ObjectID(),
            via,
            civico,
            citta,
            cap,
            provincia,
            lat: coordinates.lat,
            lon: coordinates.lon,
            predefinito
        }
    };
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
    const preferenze = req.body.preferenze;

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

    const address = await getIndirizzo(indirizzo, true);
    if (address.error) {
        return res.status(400).json({error: address.error});
    }

    const hashedPassword = await bycrypt.hash(password, 10);


    let user_no_psw;
    try {
        const user = {
            nome: nome,
            cognome: cognome,
            email: email,
            password: hashedPassword,
            indirizzi: [address.indirizzo],
            ristoratore: ristoratore,
            preferenze: preferenze
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
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({error: "ID non valido"});
    }

    const {nome, cognome, email} = req.body;
    if (typeof nome !== 'string' || nome.trim().length < 2) {
        return res.status(400).json({error: "Nome troppo corto"});
    }
    if (typeof cognome !== 'string' || cognome.trim().length < 2) {
        return res.status(400).json({error: "Cognome troppo corto"});
    }
    if (typeof email !== 'string' || !validateEmail(email)) {
        return res.status(400).json({error: "Email non valida"});
    }

    try {
        const coll = client.db('FastFood').collection('users');
        const result = await coll.updateOne(
            {_id: new ObjectId(id)},
            {$set: {nome: nome.trim(), cognome: cognome.trim(), email}}
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({error: "Utente non trovato"});
        }
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
    // #swagger.description = "elimina ristorante di un utente"
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

app.get('/ristorante/:id', async (req, res) => {
    // #swagger.description = "Recupera un ristorante per ID"
    const id = req.params.id;
    const ristorante = await client.db('FastFood').collection('ristoranti').findOne({_id: ObjectID.createFromHexString(id)});
    if (!ristorante) {
        res.status(404).send("Ristorante non trovato");
        return;
    }
    res.json(ristorante);
});

app.get('/ristorante/:id/menu', async (req, res) => {
    // #swagger.description = "Recupera il menu raggruppato per ristorante"
    const id = ObjectID.createFromHexString(req.params.id);

    try {
        const menuDettagliato = await client.db('FastFood').collection('menu').aggregate([
            {$match: {idRistorante: id}},

            {
                $lookup: {
                    from: 'ristoranti',
                    localField: 'idRistorante',
                    foreignField: '_id',
                    as: 'ristoranteInfo'
                }
            },
            {$unwind: '$ristoranteInfo'},

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
                $sort: {
                    categoria: 1,
                    nome: 1
                }
            },

            {
                $group: {
                    _id: '$idRistorante',
                    ristoranteNome: {$first: '$ristoranteInfo.nomeRistorante'},
                    ristoranteLogo: {$first: '$ristoranteInfo.logoUrl'},
                    ristoranteIndirizzo: {$first: '$ristoranteInfo.indirizzoRistorante'},
                    ristoranteTelefono: {$first: '$ristoranteInfo.telefonoRistorante'},
                    piatti: {
                        $push: {
                            _id: '$_id',
                            prezzo: '$prezzo',
                            nome: '$nome',
                            foto: '$foto',
                            categoria: '$categoria',
                            ingredienti: '$ingredienti',
                            personalizzato: '$personalizzato',
                            idProdotto: '$idProdotto',
                            ricetta: '$ricetta'
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    idRistorante: '$_id',
                    ristoranteNome: 1,
                    ristoranteLogo: 1,
                    ristoranteIndirizzo: 1,
                    ristoranteTelefono: 1,
                    piatti: 1
                }
            }
        ]).toArray();

        if (menuDettagliato.length > 0) {
            res.json(menuDettagliato[0]);
        } else {
            res.json(null);
        }

    } catch (error) {
        console.error("Errore nel recupero del menu:", error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.post('/ristorante/:id/menu/catalogo', async (req, res) => {
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
        foto: piattoCatalogo.strMealThumb,
        ricetta: piattoCatalogo.strInstructions
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
});

app.put('/ristorante/:id_user/menu/:id_prodotto', async (req, res) => {
    // #swagger.description = Aggiorna i dati di un prodotto nel menu del ristorante dell'utente
    const idUtente = req.params.id_user;
    const idProdotto = req.params.id_prodotto;
    const newPrezzo = req.body.prezzo;
    const newIngredienti = req.body.ingredienti;
    const newCategoria = req.body.categoria;
    const newNome = req.body.nome;
    const newFoto = req.body.foto;
    const newRicetta = req.body.ricetta;

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
                foto: newFoto,
                ricetta: newRicetta
            }
        }
    );

    res.json(result);

});

app.post('/ristorante/:id_user/menu/personalizzato', async (req, res) => {
// #swagger.description = Aggiunge un prodotto personalizzato al menu del ristorante dell'utente
    const idUtente = req.params.id_user;
    const nome = req.body.nome;
    const prezzo = req.body.prezzo;
    const ingredienti = req.body.ingredienti;
    const categoria = req.body.categoria;
    const foto = req.body.foto;
    const ricetta = req.body.ricetta;

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

    if (!nome || !prezzo || !ingredienti || !categoria || !ricetta || !foto) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    if (isNaN(prezzo) || prezzo <= 0) {
        return res.status(400).json({error: "Prezzo non valido"});
    }

    const result = await client.db('FastFood').collection('menu').insertOne({
        idRistorante: ristorante._id,
        nome: nome,
        prezzo: prezzo,
        ingredienti: ingredienti,
        categoria: categoria,
        foto: foto,
        ricetta: ricetta
    });

    res.json(result);
});

app.get('/ricette', async (req, res) => {
    // #swagger.description = "Recupera le ricette"
    const ricette = await client.db('FastFood')
        .collection('menu')
        .aggregate([
            {
                $project: {
                    nome: 1,
                    categoria: 1,
                    ingredienti: 1,
                    foto: 1,
                    ricetta: 1
                }
            },
            {
                $unionWith: {
                    coll: "catalogo",
                    pipeline: [
                        {
                            $project: {
                                nome: "$strMeal",
                                categoria: "$strCategory",
                                ingredienti: "$ingredients",
                                foto: "$strMealThumb",
                                ricetta: "$strInstructions"
                            }
                        }
                    ]
                }
            }
        ])
        .toArray();
    res.json(ricette);
})

app.get('/search/:query', async (req, res) => {
    // #swagger.description = "Cerca prodotti raggruppati per ristorante, o ristoranti stessi"
    const query = req.params.query;

    try {
        const results = await client.db('FastFood').collection('menu').aggregate([
            {
                $lookup: {
                    from: 'ristoranti',
                    localField: 'idRistorante',
                    foreignField: '_id',
                    as: 'ristorante'
                }
            },
            {$unwind: '$ristorante'},
            {
                $match: {
                    $or: [
                        {nome: {$regex: query, $options: 'i'}},
                        {categoria: {$regex: query, $options: 'i'}},
                        {ingredienti: {$regex: query, $options: 'i'}},
                        {'ristorante.nomeRistorante': {$regex: query, $options: 'i'}}
                    ]
                }
            },
            {
                $group: {
                    _id: '$ristorante._id',
                    ristoranteNome: {$first: '$ristorante.nomeRistorante'},
                    ristoranteTelefono: {$first: '$ristorante.telefonoRistorante'},
                    ristoranteIndirizzo: {$first: '$ristorante.indirizzoRistorante'},
                    ristoranteLogo: {$first: '$ristorante.logoUrl'},
                    // Inserisci i piatti trovati in un array
                    piatti: {
                        $push: {
                            $cond: [
                                {
                                    $or: [
                                        {$regexMatch: {input: '$nome', regex: query, options: 'i'}},
                                        {$regexMatch: {input: '$categoria', regex: query, options: 'i'}},
                                        {
                                            $anyElementTrue: {
                                                $map: {
                                                    input: {$ifNull: ['$ingredienti', []]},
                                                    as: 'ing',
                                                    in: {$regexMatch: {input: '$$ing', regex: query, options: 'i'}}
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    _id: '$_id',
                                    nome: '$nome',
                                    prezzo: '$prezzo',
                                    categoria: '$categoria',
                                    ingredienti: '$ingredienti',
                                    foto: '$foto'
                                },
                                '$$REMOVE'
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0, // Nasconde l'_id di raggruppamento
                    idRistorante: '$_id', // Lo rinomina per chiarezza
                    ristoranteNome: 1,
                    ristoranteTelefono: 1,
                    ristoranteIndirizzo: 1,
                    ristoranteLogo: 1,
                    piatti: 1
                }
            }
        ]).toArray();

        res.json(results);
    } catch (error) {
        console.error("Errore durante la ricerca:", error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.post('/user/:id/indirizzi', async (req, res) => {
    // #swagger.description = "Aggiunge un indirizzo all'utente"
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({error: "ID non valido"});

    const coll = client.db('FastFood').collection('users');
    const user = await coll.findOne({_id: new ObjectId(id)}, {projection: {indirizzi: 1}});
    if (!user) return res.status(404).json({error: "Utente non trovato"});

    const esistenti = user.indirizzi || [];
    if (esistenti.length >= 10) return res.status(400).json({error: "Massimo 10 indirizzi"});

    const predefinito = req.body.predefinito === true || esistenti.length === 0;
    const risultato = await getIndirizzo(req.body, predefinito);
    if (risultato.error) return res.status(400).json({error: risultato.error});

    try {
        if (predefinito && esistenti.length > 0) {
            await coll.updateOne({_id: user._id}, {$set: {'indirizzi.$[].predefinito': false}});
        }
        await coll.updateOne({_id: user._id}, {$push: {indirizzi: risultato.indirizzo}});
        res.json(risultato.indirizzo);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.delete('/user/:id/indirizzi/:idIndirizzo', async (req, res) => {
    // #swagger.description = "Elimina un indirizzo dell'utente"
    const {id, idIndirizzo} = req.params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(idIndirizzo)) {
        return res.status(400).json({error: "ID non valido"});
    }

    const coll = client.db('FastFood').collection('users');
    const user = await coll.findOne({_id: new ObjectId(id)}, {projection: {indirizzi: 1}});
    if (!user) return res.status(404).json({error: "Utente non trovato"});

    const indirizzi = user.indirizzi || [];
    const idInd = new ObjectId(idIndirizzo);
    const target = indirizzi.find(a => a._id.equals(idInd));
    if (!target) return res.status(404).json({error: "Indirizzo non trovato"});
    if (indirizzi.length === 1) {
        return res.status(400).json({error: "Deve rimanere almeno un indirizzo"});
    }

    try {
        await coll.updateOne({_id: user._id}, {$pull: {indirizzi: {_id: idInd}}});
        if (target.predefinito) {
            const nuovo = indirizzi.find(a => !a._id.equals(idInd));
            await coll.updateOne(
                {_id: user._id, 'indirizzi._id': nuovo._id},
                {$set: {'indirizzi.$.predefinito': true}}
            );
        }
        res.json({ok: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

client.connect()
    .then(() => {
        app.listen(port, () => console.log(`Server avviato sulla porta ${port}`));
    })
    .catch(err => console.error('Errore connessione MongoDB:', err));
