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

app.get('/', (req, res) => {
    const data = require(__dirname + "./database.json");
    let list = [];

    data.forEach((item) => {
        list.push({
            id: item.id,
            name: item.name,
            type: item.type
        });
    });

    res.render(__dirname + "/pages/index.ejs", {list});
});

app.get('/items/*', (req, res) => {
    const data = require(__dirname + "./database.json");

    data.forEach((item) => {
        if (item.id == req.url.split("/")[2]) {
            res.render(__dirname + "/pages/item.ejs", {item});
            return;
        }
    });
});

app.get('/search', (req, res) => {
    const data = require(__dirname + "./database.json");
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
                id: item.id,
                name: item.name,
                type: item.type
            });
        }
    });

    res.render(__dirname + "/pages/index.ejs", {list});
});

app.get('/add', (req, res) => {
    res.render(__dirname + "/pages/add.ejs");
});

app.post('/add/commit', (req, res) => {
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
        id: data[data.length - 1].id + 1,
        name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
        type: req.body.type,
        difficulty: parseInt(req.body.difficulty),
        doses_for: parseInt(req.body.doses_for),
        ingredients: ingredients,
        procedure: req.body.procedure
    });

    fs.writeFile(__dirname + "/database.json", 'UTF-8', JSON.stringify(data),
        (err) => {
        if (err) {
            console.log("Error in writing JSON to database");
            console.log(err);
        }
    });
    
    res.redirect('/');
});

app.get('/static/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});
