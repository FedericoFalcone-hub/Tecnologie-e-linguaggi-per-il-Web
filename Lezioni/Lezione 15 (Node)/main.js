const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const swaggerDocument = require('./swagger.json');

const mongoURL = "";
const port = 3005;
const client = new MongoClient(mongoURL);
const app = express()

app.use(express.json());
app.use(cors());
//per usare il middlware ovunque
//app.use(checkApiKeys);
//per usare il middlware su tutti i path che iniziano con /user
app.use('/user', checkApiKeys);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function getUser(id) {
    await client.connect();
    const filter = { _id: ObjectID.createFromHexString(id) };
    const user = await client.db('pwm').collection('users').findOne(filter);
    return user;
}

function checkApiKeys(req, res, next) {
    console.log("Siamo nel middlware");

    if (req.query.api_key == "1234567") {
        //controlliamo l'api key
        console.log(req.query.api_key);

        next();
    } else {
        res.status(401).send("Non autorizzato")
    }


}

app.post('/user/login', async (req, res) => {
    const nome = req.body.email;
    const password = req.body.password;
    await client.connect();
    const filter = { email: nome, password: password }
    const user = await client
        .db('pwm')
        .collection('users')
        .findOne(filter);

    if (user) {
        res.json(user)
    } else {
        res.status(401).json({ error: "Credenziali Errate" })
    }
});

app.post('/user', async (req, res) => {
    const cNome = req.body.nome;
    const cCognome = req.body.cognome;
    const cEmail = req.body.email;
    const cPassword = req.body.password;
    const cFilm_preferito = req.body.film_preferito;
    //Inizio logica di controllo dei dati

    if (cNome.length < 2) {
        res.status(401).send("Nome troppo corto");
    }
    if (cCognome.length < 2) {
        res.status(401).send("Cognome troppo corto");
    }

    try {

        const user = {
            nome: cNome,
            cognome: cCognome,
            email: cEmail,
            password: cPassword,
            film_preferito: cFilm_preferito
        };

        await client.connect();
        const result = await client.db('pwm')
            .collection('users')
            .insertOne(user);

        await client.close();

        res.json(result);

    } catch (error) {
        if (error.code == 11000) {
            res.status(409).json({ success: false, message: "Email già in uso" });
        } else {
            res.status(500).json({ success: false, message: `Errore non gestito ${error.message}` });
        }
    }

});
//per usare il middlware solo in questa rotta
//app.get('/user/:id', checkApiKeys, async (req, res) => {
app.get('/user/:id', async (req, res) => {
    const id = req.params.id;

    const result = await getUser(id);

    if (result) {
        res.json(result)
    } else {
        res.status(404).json({ error: "Utente non trovato" })
    }

    await client.close();

})

app.put('/user/:id', async (req, res) => {
    const id = req.params.id;
    const cNome = req.body.nome;
    const cCognome = req.body.cognome;
    const cEmail = req.body.email;
    const cFilm_preferito = req.body.film_preferito;
    //Inizio logica di controllo dei dati

    if (cNome.length < 2) {
        res.status(401).send("Nome troppo corto");
    }
    if (cCognome.length < 2) {
        res.status(401).send("Cognome troppo corto");
    }

    if (cEmail == "valerio.bellandi@gmail.com") {
        res.status(409).send("Email già in uso");
    }
    try {
        //Fine logica di controllo dei dati
        await client.connect();
        const coll = client.db('pwm').collection('users');
        const result = await coll.updateOne(
            { _id: ObjectID.createFromHexString(id) },
            {
                $set: {
                    nome: cNome,
                    cognome: cCognome,
                    email: cEmail,
                    film_preferito: cFilm_preferito
                }
            });
        res.json(result);
        await client.close();
    } catch (error) {
        if (error.code == 11000) {
            res.status(409).json({ success: false, message: "Email già in uso" });
        } else {
            res.status(500).json({ success: false, message: error.message });

        }
    }
})

app.delete('/user/:id', async (req, res) => {
    const id = req.params.id;
    await client.connect();
    const result = await client.db('pwm')
        .collection('users')
        .deleteOne({ _id: ObjectID.createFromHexString(id) })

    res.json(result);

});

app.get("/user/:id/preferiti", async (req, res) => {
    // #swagger.description = 'Restituisce il film preferito di un utente'

    res.json({ "film_preferito": "Avatar" });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})