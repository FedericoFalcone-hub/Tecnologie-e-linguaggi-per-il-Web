const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const swaggerDocument = require('./swagger.json');
const crypto = require('crypto');

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

    return await client.db('FastFood').collection('users').findOne(
        {_id: ObjectId.createFromHexString(id)},
        {projection: {carte: 0}}
    );
}

async function getRistoranteRistoratore(idRistoratore) {

    const filter = {idRistoratore: idRistoratore};
    return await client.db('FastFood').collection('ristoranti').findOne(filter);
}

async function getRistorante(id) {
    const filter = {_id: ObjectId.createFromHexString(id)};
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

async function prossimoNumeroOrdine() {
    const risultato = await client.db('FastFood').collection('contatori').findOneAndUpdate(
        {_id: 'ordini'},
        {$inc: {seq: 1}},
        {upsert: true, returnDocument: 'after'}
    );
    return (risultato.value ?? risultato).seq;
}

async function codaOrdine(ordine) {
    const TEMPO_PREPARAZIONE = 10;
    if (ordine.metodoRitiro !== 'ritiro') return null;
    if (!['ordinato', 'preparazione'].includes(ordine.stato)) return null;

    const filtro = {
        ristoranteId: ordine.ristoranteId,
        stato: 'preparazione'
    }
    if (ordine.stato === 'preparazione') {
        filtro.dataPreparazione = {$lt: ordine.dataPreparazione};
    }

    const ordiniAvanti = await client.db('FastFood').collection('ordini').countDocuments(filtro);

    return {
        ordiniAvanti,
        tempoStimato: (ordiniAvanti + 1) * TEMPO_PREPARAZIONE
    };

}

const SCONTO_CATEGORIA = 10;
const PEZZI_PER_CODICE = 10;

async function categorieOrdinate(utente) {
    if (!utente || utente.ristoratore || utente.preferenze !== true) return [];

    const risultato = await client.db('FastFood').collection('ordini').aggregate([
        {$match: {idUtente: {$in: [utente._id.toString(), utente._id]}, stato: {$ne: 'annullato'}}},
        {$unwind: '$prodotti'},
        {
            $lookup: {
                from: 'menu',
                let: {idPiatto: {$convert: {input: '$prodotti.id', to: 'objectId', onError: null, onNull: null}}},
                pipeline: [{$match: {$expr: {$eq: ['$_id', '$$idPiatto']}}}],
                as: 'piatto'
            }
        },
        {$unwind: '$piatto'},
        {
            $lookup: {
                from: 'catalogo',
                let: {
                    idProdotto: {
                        $convert: {
                            input: '$piatto.idProdotto',
                            to: 'objectId',
                            onError: null,
                            onNull: null
                        }
                    }
                },
                pipeline: [{$match: {$expr: {$eq: ['$_id', '$$idProdotto']}}}],
                as: 'dettagli'
            }
        },
        {$addFields: {categoria: {$ifNull: [{$arrayElemAt: ['$dettagli.strCategory', 0]}, '$piatto.categoria']}}},
        {$match: {categoria: {$ne: null}}},
        {$group: {_id: '$categoria', ordinati: {$sum: '$prodotti.quantita'}}},
        {$sort: {ordinati: -1, _id: 1}},
    ]).toArray();

    return risultato.map(r => ({categoria: r._id, ordinati: r.ordinati}));
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

const generaCodice = () => `BB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;


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

function formattaIndirizzo({via, civico, cap, citta, provincia}) {
    return `${via} ${civico}, ${cap} ${citta} (${provincia})`;
}

app.post('/user/:id/ristorante', async (req, res) => {
    // #swagger.description = "Registra un ristorante per un utente"
    const id = req.params.id;
    const user = await getUser(id);

    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const {nomeRistorante, partitaIVA, telefonoRistorante, via, civico, citta, cap, provincia, tipoCucina} = req.body;

    if (!nomeRistorante || !partitaIVA || !telefonoRistorante || !via || !civico || !citta || !cap || !provincia || !tipoCucina) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    const indirizzo = {
        via: via.trim(),
        civico: civico.trim(),
        citta: citta.trim(),
        cap: cap.trim(),
        provincia: provincia.trim().toUpperCase()
    };
    const indirizzoTesto = formattaIndirizzo(indirizzo);

    const coordinates = await getCoordinates(indirizzoTesto);
    if (!coordinates) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }

    try {
        const ristorante = {
            nomeRistorante,
            partitaIVA,
            idRistoratore: id,
            telefonoRistorante,
            via: via,
            civico: civico,
            citta: citta,
            cap: cap,
            provincia: provincia.toUpperCase(),
            lat: coordinates.lat,
            lon: coordinates.lon,
            logoUrl: null,
            tipoCucina: tipoCucina
        };
        await client.db('FastFood').collection('ristoranti').insertOne(ristorante);

        res.json(ristorante);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({error: "Partita IVA già registrata"});
        }
        res.status(500).json({error: `Errore non gestito ${error.message}`});
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

    if (!await getRistoranteRistoratore(id)) {
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
    const user = await getUser(id);
    if (!user) {
        return res.status(404).json({error: "Utente non trovato"});
    }
    if (!user.ristoratore) {
        return res.status(403).json({error: "Utente non autorizzato"});
    }

    const ristorante = await getRistoranteRistoratore(id);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    const {nomeRistorante, partitaIVA, telefonoRistorante, via, civico, citta, cap, provincia, tipoCucina} = req.body;

    if (!nomeRistorante || !partitaIVA || !telefonoRistorante || !via || !civico || !citta || !cap || !provincia || !tipoCucina) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    const indirizzo = {
        via: via.trim(),
        civico: civico.trim(),
        citta: citta.trim(),
        cap: cap.trim(),
        provincia: provincia.trim().toUpperCase()
    };
    const indirizzoTesto = formattaIndirizzo(indirizzo);


    const coordinates = await getCoordinates(indirizzoTesto);
    if (!coordinates) {
        return res.status(400).json({error: "Indirizzo ristorante non valido"});
    }

    const datiModificati = {
        nomeRistorante,
        partitaIVA,
        telefonoRistorante,
        via: via,
        civico: civico,
        citta: citta,
        cap: cap,
        provincia: provincia.toUpperCase(),
        lat: coordinates.lat,
        lon: coordinates.lon,
        tipoCucina: tipoCucina
    };

    try {
        await client.db('FastFood').collection('ristoranti').updateOne(
            {idRistoratore: id},
            {$set: datiModificati}
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

    const ristorante = await getRistoranteRistoratore(id);
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
                    categoria: {$ifNull: [{$arrayElemAt: ['$dettagli.strCategory', 0]}, '$categoria']},
                    indirizzoFormattato: {
                        $concat: [
                            '$ristoranteInfo.via', ' ',
                            '$ristoranteInfo.civico', ', ',
                            '$ristoranteInfo.cap', ', ',
                            '$ristoranteInfo.citta', ' (',
                            '$ristoranteInfo.provincia', ')'
                        ]
                    },
                    ordineCategoria: {
                        $switch: {
                            branches: [
                                {
                                    case: {$eq: ["$categoria", "Antipasti"]},
                                    then: 1
                                },
                                {
                                    case: {$eq: ["$categoria", "Primi"]},
                                    then: 2
                                },
                                {
                                    case: {$eq: ["$categoria", "Secondi"]},
                                    then: 3
                                },
                                {
                                    case: {$eq: ["$categoria", "Dessert"]},
                                    then: 5
                                }
                            ],
                            default: 4
                        }
                    }
                }
            },

            {
                $sort: {
                    ordineCategoria: 1,
                    nome: 1
                }
            },

            {
                $group: {
                    _id: '$idRistorante',
                    ristoranteNome: {$first: '$ristoranteInfo.nomeRistorante'},
                    ristoranteLogo: {$first: '$ristoranteInfo.logoUrl'},
                    ristoranteIndirizzo: {$first: '$indirizzoFormattato'},
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

    const ristorante = await getRistoranteRistoratore(idUtente);
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

    const ristorante = await getRistoranteRistoratore(idUtente);
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

    const ristorante = await getRistoranteRistoratore(idUtente);
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

    const ristorante = await getRistoranteRistoratore(idUtente);
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

app.post('/user/:id/carta-pagamento', async (req, res) => {
    // #swagger.description = "Aggiunge una carta di pagamento all'utente"
    const {id} = req.params;

    if (!await getUser(id)) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    const coll = client.db('FastFood').collection('users');

    const {intestatario, numero, scadenza} = req.body;

    if (numero.length !== 16 || !/^\d+$/.test(numero)) {
        return res.status(400).json({error: "Numero carta non valido"});
    }
    if (!/^\d{2}\/\d{2}$/.test(scadenza)) {
        return res.status(400).json({error: "Scadenza non valida"});
    }

    const nuovaCarta = {
        _id: new ObjectId(),
        intestatario,
        numero: numero.slice(-4),
        scadenza,
    };

    try {
        const user = await getUser(id);
        if (!user) {
            return res.status(404).json({error: "Utente non trovato"});
        }
        await coll.updateOne({_id: user._id}, {$push: {carte: nuovaCarta}});
        res.json(nuovaCarta);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/user/:id/carte-pagamento', async (req, res) => {
    const {id} = req.params;

    if (!await getUser(id)) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    const coll = client.db('FastFood').collection('users');
    const user = await coll.findOne({_id: new ObjectId(id)}, {projection: {carte: 1}});
    if (!user) return res.status(404).json({error: "Utente non trovato"});
    res.json(user.carte || []);
});

app.post('/user/:id/ordine', async (req, res) => {
    // #swagger.description = "Crea un nuovo ordine per l'utente"
    const {id} = req.params;
    const {
        ristoranteId,
        sconto,
        metodoRitiro,
        indirizzoConsegna,
        metodoPagamento,
        prodotti,
        nomeCliente,
        cognomeCliente
    } = req.body;

    if (!await getUser(id)) {
        return res.status(404).json({error: "Utente non trovato"});
    }
    if (!nomeCliente || !cognomeCliente || !ristoranteId || !metodoRitiro || !metodoPagamento || !prodotti || !Array.isArray(prodotti) || prodotti.length === 0) {
        return res.status(400).json({error: "Dati mancanti"});
    }
    const ristorante = await getRistorante(ristoranteId);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }
    const numeroOrdine = await prossimoNumeroOrdine();
    const coll = client.db('FastFood').collection('ordini');
    const nuovoOrdine = {
        ristoranteId,
        idUtente: id,
        metodoRitiro,
        nomeCliente: nomeCliente,
        cognomeCliente: cognomeCliente,
        indirizzoConsegna: metodoRitiro === 'domicilio'
            ? indirizzoConsegna
            : {
                via: ristorante.via,
                civico: ristorante.civico,
                cap: ristorante.cap,
                citta: ristorante.citta,
                provincia: ristorante.provincia
            },
        metodoPagamento,
        sconto,
        prodotti,
        stato: 'ordinato',
        numeroOrdine,
        data: new Date()
    };

    try {
        const result = await coll.insertOne(nuovoOrdine);
        res.json({...nuovoOrdine, _id: result.insertedId});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/ordine/:id', async (req, res) => {
    // #swagger.description = "Recupera un ordine per ID"
    const {id} = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({error: "ID ordine non valido"});
    }

    try {
        const db = client.db('FastFood');
        const ordine = await db.collection('ordini').findOne({_id: new ObjectId(id)});
        if (!ordine) return res.status(404).json({error: "Ordine non trovato"});

        const ristorante = await db.collection('ristoranti').findOne(
            {_id: new ObjectId(ordine.ristoranteId)},
            {projection: {nomeRistorante: 1}}
        );

        res.json({
            ...ordine,
            nomeRistorante: ristorante?.nomeRistorante || null,
            coda: await codaOrdine(ordine)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.get('/user/:id/ristorante/ordini', async (req, res) => {
    // #swagger.description = "Recupera gli ordini del ristorante del ristoratore
    const {id} = req.params;
    if (!await getUser(id)) {
        return res.status(404).json({error: "Utente non trovato"});
    }

    const ristorante = await getRistoranteRistoratore(id);
    if (!ristorante) {
        return res.status(404).json({error: "Ristorante non trovato"});
    }

    try {
        const ordini = await client.db('FastFood').collection('ordini')
            .find({ristoranteId: {$in: [ristorante._id.toString(), ristorante._id]}})
            .sort({dataOrdine: -1})
            .toArray();

        res.json(ordini);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno"});
    }
});

app.put('/user/:id/ristorante/ordini/:numeroOrdine/stato/aggiorna', async (req, res) => {
    // #swagger.description = "Aggiorna lo stato di un ordine del ristorante del ristoratore"
    try {
        const numeroOrdine = req.params.numeroOrdine;
        const id = req.params.id;

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});

        const ristorante = await getRistoranteRistoratore(id);
        if (!ristorante) return res.status(404).json({error: "Ristorante non trovato"});

        const ordini = client.db('FastFood').collection('ordini');
        const filtro = {
            ristoranteId: {$in: [ristorante._id.toString(), ristorante._id]},
            numeroOrdine: parseInt(numeroOrdine)
        };

        const ordine = await ordini.findOne(filtro);

        if (!ordine) return res.status(404).json({error: "Ordine non trovato"});

        if (ordine.stato === 'consegnato') {
            return res.status(400).json({error: "Ordine già consegnato"});
        }

        if (ordine.stato === 'annullato') {
            return res.status(400).json({error: "Ordine annullato"});
        }

        let stato;

        if (ordine.stato === 'ordinato') {
            stato = 'preparazione';
        } else if (ordine.stato === 'preparazione' && ordine.metodoRitiro === 'domicilio') {
            stato = 'consegna';
        } else if (ordine.stato === 'consegna' || (ordine.stato === 'preparazione' && ordine.metodoRitiro === 'ritiro')) {
            stato = 'consegnato';
        }

        const updateDoc = {
            $set: {stato}
        };

        if (stato === 'preparazione') {
            updateDoc.$set.dataPreparazione = new Date();
        } else if (stato === 'consegnato') {
            updateDoc.$set.dataConsegna = new Date();
            updateDoc.$unset = {dataPreparazione: ""};
        }

        await ordini.updateOne({...filtro, stato: ordine.stato}, updateDoc);

        const responseOrdine = {...ordine, ...updateDoc.$set};
        if (updateDoc.$unset && updateDoc.$unset.dataPreparazione !== undefined) {
            delete responseOrdine.dataPreparazione;
        }

        res.json(responseOrdine);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.put('/user/:id/ristorante/ordini/:numeroOrdine/stato/annulla', async (req, res) => {
    // #swagger.description = "Annulla un ordine del ristorante del ristoratore"
    try {
        const numeroOrdine = req.params.numeroOrdine;
        const id = req.params.id;

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});

        const ristorante = await getRistoranteRistoratore(id);
        if (!ristorante) return res.status(404).json({error: "Ristorante non trovato"});

        const ordini = client.db('FastFood').collection('ordini');
        const filtro = {
            ristoranteId: {$in: [ristorante._id.toString(), ristorante._id]},
            numeroOrdine: parseInt(numeroOrdine)
        };

        const ordine = await ordini.findOne(filtro);

        if (!ordine) return res.status(404).json({error: "Ordine non trovato"});

        if (ordine.stato === 'consegnato') {
            return res.status(400).json({error: "Ordine già consegnato"});
        }

        if (ordine.stato === 'annullato') {
            return res.status(400).json({error: "Ordine già annullato"});
        }

        if (ordine.stato === 'consegna') {
            return res.status(400).json({error: "Ordine in consegna, non può essere annullato"});
        }

        const set = {stato: 'annullato'};
        await ordini.updateOne({...filtro, stato: ordine.stato}, {$set: set});
        res.json({...ordine, ...set});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.get('/user/:id/ordini', async (req, res) => {
    // #swagger.description = "Recupera gli ordini di un utente"
    try {
        const id = req.params.id;

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});

        const ordini = client.db('FastFood').collection('ordini');
        const filtro = {
            idUtente: {$in: [utente._id.toString(), utente._id]}
        };

        const ordiniUtente = await ordini.find(filtro).toArray();
        res.json(ordiniUtente);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.put('/user/:id/ordini/:numeroOrdine/ritira', async (req, res) => {
    // #swagger.description = "Ritira un ordine di un utente"
    try {
        const numeroOrdine = req.params.numeroOrdine;
        const id = req.params.id;

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});

        const ordini = client.db('FastFood').collection('ordini');
        const filtro = {
            numeroOrdine: parseInt(numeroOrdine)
        };

        const ordine = await ordini.findOne(filtro);

        if (!ordine) return res.status(404).json({error: "Ordine non trovato"});

        if (ordine.stato === 'consegnato') {
            return res.status(400).json({error: "Ordine già consegnato"});
        }

        if (ordine.stato === 'annullato') {
            return res.status(400).json({error: "Ordine annullato"});
        }

        if (ordine.stato === 'preparazione') {
            return res.status(400).json({error: "Ordine in preparazione, non può essere ritirato"});
        }

        if (ordine.stato === 'ordinato') {
            return res.status(400).json({error: "Ordine non pronto per il ritiro"});
        }

        if (ordine.metodoRitiro !== 'domicilio') {
            return res.status(400).json({error: "Ordine non è per consegna a domicilio, non può essere ritirato"});
        }

        const updateDoc = {
            $set: {
                stato: 'consegnato',
                dataConsegna: new Date()
            },
            $unset: {
                dataPreparazione: ""
            }
        };

        await ordini.updateOne({...filtro, stato: ordine.stato}, updateDoc);
        res.json({...ordine, ...updateDoc.$set});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.get('/user/:id/offerte', async (req, res) => {
    // #swagger.description = "Codici sconto sbloccati dall'utente (solo con preferenze accettate)"
    try {
        const {id} = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({error: "ID utente non valido"});
        }

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});
        if (utente.ristoratore) return res.status(403).json({error: "Offerte riservate ai clienti"});

        const codici = client.db('FastFood').collection('codici_sconto');
        const categorie = await categorieOrdinate(utente);
        for (const {categoria, ordinati} of categorie) {
            if (ordinati < PEZZI_PER_CODICE) continue;
            try {

                const codicePrecedente = await codici.findOne({utenteId: id, categoria});
                if (codicePrecedente) {
                    if (codicePrecedente.usato === false) {
                        continue
                    }
                    if (ordinati - codicePrecedente.ordinati < PEZZI_PER_CODICE) {
                        continue
                    } else {
                        await codici.insertOne({
                                utenteId: id,
                                categoria,
                                codice: generaCodice(),
                                ordinati: ordinati,
                                sconto: SCONTO_CATEGORIA,
                                usato: false
                            }
                        );
                        continue
                    }
                }

                await codici.updateOne(
                    {utenteId: id, categoria},
                    {
                        $setOnInsert: {
                            codice: generaCodice(),
                            ordinati: ordinati,
                            sconto: SCONTO_CATEGORIA,
                            usato: false
                        }
                    },
                    {upsert: true}
                );
            } catch (error) {
                if (error.code !== 11000) console.log(`Errore durante la gestione dei codici sconto per utente ${id} e categoria ${categoria}:`, error);
            }
        }

        const disponibili = utente.preferenze === true
            ? await codici.find({utenteId: id, usato: false}).sort({categoria: 1}).toArray()
            : [];

        res.json({
            offerte: disponibili.map(c => ({categoria: c.categoria, sconto: c.sconto, codice: c.codice}))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

app.post('/user/consumaCodice', async (req, res) => {
    // #swagger.description = "Utilizza un codice sconto"
    const categorieCarrello = req.body.categorieCarrello;
    const codice = req.body.codice;
    const idUtente = req.body.idUtente;

    if (!categorieCarrello || !codice || !idUtente) {
        return res.status(400).json({error: "Dati mancanti"});
    }

    try {
        const risultato = await client.db('FastFood').collection('codici_sconto').findOneAndUpdate(
            {
                utenteId: idUtente,
                codice: codice,
                usato: false,
                categoria: {$in: categorieCarrello}
            },
            {$set: {usato: true, usatoIl: new Date()}},
            {returnDocument: 'after'}
        );

        const codiceSconto = risultato?.value ?? risultato;
        if (!codiceSconto) {
            const esistente = await client.db('FastFood').collection('codici_sconto').findOne({
                utenteId: idUtente,
                codice: codice,
                usato: false
            });
            return res.status(400).json({
                error: esistente
                    ? `Il codice vale solo per la categoria ${esistente.categoria}`
                    : "Codice non valido o già utilizzato"
            });
        }
        res.json(risultato);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Errore interno del server"});
    }


});

app.get('/user/:id/ristorante/statistiche/mensili', async (req, res) => {
    // #swagger.description = "Recupera le statistiche mensili e il resoconto totale di un anno specifico (?anno=2026)"
    try {
        const id = req.params.id;

        const annoRichiesto = parseInt(req.query.anno) || new Date().getFullYear();

        const dataInizio = new Date(annoRichiesto, 0, 1);
        const dataFine = new Date(annoRichiesto + 1, 0, 1);

        const utente = await getUser(id);
        if (!utente) return res.status(404).json({error: "Utente non trovato"});
        if (!utente.ristoratore) return res.status(403).json({error: "Utente non autorizzato"});

        const ristorante = await getRistoranteRistoratore(id);
        if (!ristorante) return res.status(403).json({error: "Ristorante non trovato"});

        const ordini = client.db('FastFood').collection('ordini');

        const filtro = {
            ristoranteId: {$in: [ristorante._id.toString(), ristorante._id]},
            stato: 'consegnato',
            data: {$gte: dataInizio, $lt: dataFine}
        };

        // STATISTICHE MENSILI
        const statsMensili = await ordini.aggregate([
            {$match: filtro},
            {
                $addFields: {
                    mese: {$month: {date: '$data', timezone: 'Europe/Rome'}},
                    durataMinuti: {
                        $divide: [{$subtract: ['$dataConsegna', '$data']}, 60000]
                    },
                    incassoOrdine: {
                        $reduce: {
                            input: '$prodotti',
                            initialValue: 0,
                            in: {$add: ['$$value', {$multiply: ['$$this.prezzo', '$$this.quantita']}]}
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$mese',
                    incassoTotale: {$sum: '$incassoOrdine'},
                    numeroOrdini: {$sum: 1},
                    durataMedia: {$avg: '$durataMinuti'}
                }
            }
        ]).toArray();

        // PIATTI PIÙ VENDUTI PER MESE
        const piattiPerMese = await ordini.aggregate([
            {$match: filtro},
            {
                $addFields: {mese: {$month: {date: '$data', timezone: 'Europe/Rome'}}}
            },
            {$unwind: '$prodotti'},
            {
                $group: {
                    _id: {mese: '$mese', nomePiatto: '$prodotti.nome'},
                    pezziVenduti: {$sum: '$prodotti.quantita'}
                }
            },
            {$sort: {pezziVenduti: -1}}, {
                $group: {
                    _id: '$_id.mese',
                    piattiTop: {$push: {nome: '$_id.nomePiatto', quantita: '$pezziVenduti'}}
                }
            },
            {
                $project: {_id: 1, piattiTop: {$slice: ['$piattiTop', 5]}}
            }
        ]).toArray();

        // PIATTI PIÙ VENDUTI IN TUTTO L'ANNO
        const piattiAnno = await ordini.aggregate([
            {$match: filtro},
            {$unwind: '$prodotti'},
            {
                $group: {
                    _id: '$prodotti.nome',
                    quantita: {$sum: '$prodotti.quantita'}
                }
            },
            {$sort: {quantita: -1}}, {$limit: 5} // Prendi i primi 5 dell'intero anno
        ]).toArray();

        const statsMap = new Map(statsMensili.map(s => [s._id, s]));
        const piattiMap = new Map(piattiPerMese.map(p => [p._id, p.piattiTop]));

        let totaleIncassoAnno = 0;
        let totaleOrdiniAnno = 0;
        let sommaDurataPesata = 0;

        // GENERAZIONE ARRAY 12 MESI
        const arrayMesi = Array.from({length: 12}, (_, i) => {
            const meseNum = i + 1;
            const stat = statsMap.get(meseNum);
            const piatti = piattiMap.get(meseNum) || [];

            if (!stat) {
                return {
                    mese: meseNum,
                    incassoTotale: 0,
                    numeroOrdini: 0,
                    scontrinoMedio: 0,
                    tempoPreparazioneMedio: 0,
                    piattiPiuAcquistati: []
                };
            }

            totaleIncassoAnno += stat.incassoTotale;
            totaleOrdiniAnno += stat.numeroOrdini;
            sommaDurataPesata += (stat.durataMedia * stat.numeroOrdini);

            return {
                mese: meseNum,
                incassoTotale: Number(stat.incassoTotale.toFixed(2)),
                numeroOrdini: stat.numeroOrdini,
                scontrinoMedio: Number((stat.incassoTotale / stat.numeroOrdini).toFixed(2)),
                tempoPreparazioneMedio: Math.round(stat.durataMedia),
                piattiPiuAcquistati: piatti
            };
        });

        // CALCOLO RESOCONTO TOTALE ANNUALE
        const totaliAnno = {
            incassoTotale: Number(totaleIncassoAnno.toFixed(2)),
            numeroOrdini: totaleOrdiniAnno,
            scontrinoMedio: totaleOrdiniAnno > 0 ? Number((totaleIncassoAnno / totaleOrdiniAnno).toFixed(2)) : 0,
            tempoPreparazioneMedio: totaleOrdiniAnno > 0 ? Math.round(sommaDurataPesata / totaleOrdiniAnno) : 0,
            piattiPiuAcquistati: piattiAnno.map(p => ({
                nome: p._id,
                quantita: p.quantita
            }))
        };

        res.json({
            anno: annoRichiesto,
            totaliAnno: totaliAnno,
            mesi: arrayMesi
        });

    } catch (error) {
        console.error("Errore recupero statistiche:", error);
        res.status(500).json({error: "Errore interno del server"});
    }
});

client.connect()

    .then(() => {
        app.listen(port, () => console.log(`Server avviato sulla porta ${port}`));
    })
    .catch(err => console.error('Errore connessione MongoDB:', err));
