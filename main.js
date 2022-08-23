var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var fs = require("fs");
//var favicon = require("serve-favicon");

var app = express();
var server = http.createServer(app);
//app.use(favicon(__dirname + '/static/images/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs');

server.listen(8000, () => {
  console.log("Server listening at port 8000");
});

function overwriteDatabase(data) {
    fs.writeFile(__dirname + "/database.json", JSON.stringify(data), (err) => {
        if (err) {
            console.log("Error in writing JSON to database");
            console.log(err);
        }
    });
}

function popFromDatabase(index) {
    let data = require(__dirname + "/database.json");
    data.splice(index, 1);

    overwriteDatabase(data);
}

function appendToDatabase(req, res) {
    let data = require(__dirname + "/database.json");
    let ingredients = [];

    for (let key in req.body) {
        if (key.startsWith("ingr-") && key.endsWith("-name") &&
            req.body[key] !== "") {
            ingredients.push({
                name: req.body[key],
                amount: req.body["ingr-" + key.split("-")[1] + "-amount"]
            });
        }
    }

    data.push({
        name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
        type: req.body.type,
        difficulty: parseInt(req.body.difficulty),
        doses_for: parseInt(req.body.doses_for),
        ingredients: ingredients,
        procedure: req.body.procedure
    });

    overwriteDatabase(data);
    
    res.redirect('/');
}

app.get('/', (req, res) => {
    const data = require(__dirname + "/database.json");
    let list = [];

    data.forEach((item) => {
        list.push({
            id: data.indexOf(item),
            name: item.name,
            type: item.type
        });
    });

    res.render(__dirname + "/pages/index.ejs", {list});
});

app.get('/items/*', (req, res) => {
    const data = require(__dirname + "/database.json");

    const index = req.url.split("/")[2];
    const item = data[index];
    res.render(__dirname + "/pages/item.ejs", {item, id: index});
});

app.get('/search', (req, res) => {
    const data = require(__dirname + "/database.json");
    let list = [];

    data.forEach((item) => {
        let skip = false;
        let name = item.name.toLowerCase();

        req.query.q.split(" ").forEach((query) => {
            if (!name.split(" ").includes(query.toLowerCase())) {
                skip = true;
            }
        });

        if (!skip) {
            list.push({
                id: data.indexOf(item),
                name: item.name,
                type: item.type
            });
        }
    });

    res.render(__dirname + "/pages/index.ejs", {list});
});

app.get('/add', (req, res) => {
    res.render(__dirname + "/pages/add.ejs", {item: undefined});
});

app.post('/add/commit', appendToDatabase);

app.post('/edit/commit/*', (req, res) => {
    popFromDatabase(req.url.split("/")[3]);
    appendToDatabase(req, res);
});

app.get('/edit/*', (req, res) => {
    const data = require(__dirname + "/database.json");
    const id = req.url.split("/")[2];
    const item = data[id];

    res.render(__dirname + "/pages/add.ejs", {item, id});
});

app.get('/delete/commit/*', (req, res) => {
    popFromDatabase(req.url.split("/")[3]);
    res.redirect("/");
});

app.get('/delete/*', (req, res) => {
    // this function only renders the confirmation page
    const data = require(__dirname + "/database.json");
    const id = req.url.split("/")[2];
    const name = data[id].name;

    res.render(__dirname + "/pages/delete.ejs", {id, name});
});

app.get('/static/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});
