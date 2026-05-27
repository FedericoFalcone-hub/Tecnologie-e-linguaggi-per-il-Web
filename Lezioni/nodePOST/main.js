const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const mongoURL = "";
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/loginno', async (req, res) => {
    const nome = req.body.email;
    const password = req.body.password;
    const client = await MongoClient.connect(mongoURL);
    const coll = client.db('pwm').collection('users');
    const filter = { email: nome, password: password }

    const cursor = coll.find(filter);
    const result = await cursor.toArray();
    console.log(result);

    // controlli campi
    //cerco se utente con email presente... con un bel find

    // se errore neotifico errore
    // se email presente allora controlla la pwd
    // se pwd non combacia allore errore
    //se pwd corretta restituisco un ok 
    if (result.length > 0) {
        res.send("OK")
    } else {
        res.status(401).send("KO")
    }
});

app.get('/movies', async (req, res) => {
    let year = req.query.year;
    const rated = req.query.rated;
    let to = req.query.to;
    let time = req.query.time;
    var filter = {}

    if (year === undefined)
        year = 1900;
    console.log(year);

    if (to === undefined)
        to = 2400;

    if (time === undefined)
        time = 0;


    console.log(to);

    filter.year = { "$gte": parseInt(year), "$lte": parseInt(to) };
    filter.runtime = { "$gte": parseInt(time) };
    //mettere in or {year:{$gt:2010,$lt:2020},runtime:{$gt:100}}--  

    console.log(filter);

    const client = await MongoClient.connect(mongoURL);
    const coll = client.db('sample_mflix').collection('movies');
    const cursor = coll.find(filter);
    const result = await cursor.toArray();
    await client.close();
    res.json(result);
})

// const ObjectID = require('mongodb').ObjectId;
app.get('/movies/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const client = await MongoClient.connect(mongoURL);
    const coll = client.db('sample_mflix').collection('movies');
    const cursor = coll.find(new ObjectID(id));
    const result = await cursor.toArray();
    await client.close();
    res.json(result);

})

app.post('/user', async (req, res) => {
    const cNome = req.body.nome;
    const cCognome = req.body.cognome;
    const cEmail = req.body.email;
    const cPassword = req.body.password;
    const cGenre = req.body.genre;
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
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('pwm').collection('users');
        const user = {
            nome: cNome,
            cognome: cCognome,
            email: cEmail,
            password: cPassword,
            genre: cGenre
        }

        const result = await coll.insertOne(user);
        console.log("ok");
        console.log(result);
        res.json(result);
        await client.close();

    } catch (error) {
        if (error.code == 11000) {
            res.status(409).json({ success: false, message: "Email già in uso" });
        } else {
            res.status(500).json({ success: false, message: "Errore non gestito" });

        }
    }



    res.send();
});

app.delete('/user/:id', (req, res) => {
    const id = req.params.id;
    res.send(`DELETED ${id}`);
})

app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    res.send(`UTENTE ${id}`);
})

app.put('/user/:id', (req, res) => {
    const id = req.params.id;
    res.send(`AGGIORNATO ${id}`);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})