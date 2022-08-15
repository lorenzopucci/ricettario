var express = require("express");
var http = require("http");
//var favicon = require("serve-favicon");

var app = express();
var server = http.createServer(app);
//app.use(favicon(__dirname + '/static/images/favicon.ico'));
app.set('view engine', 'ejs');

server.listen(8000, () => {
  console.log("Server listening at port 8000");
});

app.get('/', (req, res) => {
    const data = require("./database.json");
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
    const data = require("./database.json");

    data.forEach((item) => {
        if (item.id == req.url.split("/")[2]) {
            res.render(__dirname + "/pages/item.ejs", {item});
            return;
        }
    });
});

app.get('/static/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});
