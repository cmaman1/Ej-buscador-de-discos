const express = require("express");
const path = require("path");
const exphbs = require('express-handlebars');
const app = express();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dbURL = "mongodb://localhost:27017";
const dbConfig = { useNewUrlParser: true, useUnifiedTopology: true, family: 4 };
const dbName = "discosdb";
const puerto = 4000;

console.log(`Probando conexión con MongoDB.\nServidor: ${dbURL}\nBase: ${dbName}\nColección: : discos\n`);

app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layout')
}));
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'));

app.get("/", (req, res) => {
    res.render('home', {
        titulo: "Discos - HOME"
    });
});

app.get("/discos", (req, res) => {
    MongoClient.connect(dbURL, dbConfig, (err, client) => {
        if (!err) {
            const discosdb = client.db(dbName);
            const colDiscos = discosdb.collection("discos");

            let filtros = {};
            if (req.query.lanzamiento) { filtros.lanzamiento = parseInt(req.query.lanzamiento); }
            if (req.query.artista) { filtros.artista = req.query.artista; }

            console.log(filtros);
            colDiscos.find(filtros).toArray((err, discos) => {
                client.close();

                res.render('discos', {
                    listaDiscos: discos,
                    titulo: "Discos - Consulta"
                });
            });

        } else {
            console.log("ERROR AL CONECTAR: " + err);
        }
    })
});

app.listen(puerto, () => {
    console.log(`Corriendo en puerto ${puerto}`);
});