let express = require("express");
let http = require("http");
let fs = require("fs");
let formidable = require("formidable");
let favicon = require("serve-favicon");

let app = express();
let server = http.createServer(app);
app.use(favicon(__dirname + '/static/favicon.ico'));
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

function popFromDatabase(index, deleteImage = false) {
    let data = require(__dirname + "/database.json");

    if (deleteImage && data[index].image !== "") {
        fs.unlinkSync(__dirname + "/static/img/" + data[index].image);
    }

    data.splice(index, 1);

    overwriteDatabase(data);
}

function appendToDatabase(req, uploadImg = false, currentImg = "") {
    const formidableForm = new formidable.IncomingForm();
    const data = require(__dirname + "/database.json");
    const uploadPath = __dirname + "/static/img";
    formidableForm.uploadDir = uploadPath;

    formidableForm.parse(req, (err, fields, files) => {
        if (err) {
            console.log("Error in file upload");
            console.log(err);
        }

        if (uploadImg && files.img.originalFilename !== "") {
            const file = files.img;
            try {
                fs.renameSync(file.filepath, uploadPath +"/"+ file.newFilename);
                currentImg = file.newFilename;
            } catch (err) {
                console.log("Error in image upload");
                console.log(err);
            }
        }

        let ingredients = [];
        for (let key in fields) {
            if (key.startsWith("ingr-") && key.endsWith("-name") &&
                fields[key] !== "") {

                ingredients.push({
                    name: fields[key],
                    amount: fields["ingr-" + key.split("-")[1] + "-amount"]
                });
            }
        }

        data.push({
            name: fields.name.charAt(0).toUpperCase() + fields.name.slice(1),
            type: fields.type,
            difficulty: parseInt(fields.difficulty),
            doses_for: parseInt(fields.doses_for),
            image: currentImg,
            ingredients: ingredients,
            procedure: fields.procedure,
        });

        overwriteDatabase(data);
    });
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

        req.query.q.split(" ").forEach((query) => {
            if (!( item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.type.toLowerCase().includes(query.toLowerCase()) )) {
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

app.post('/add/commit', (req, res) => {
    appendToDatabase(req, true);
    res.redirect("/");
});

app.post('/edit/commit/*', (req, res) => {
    const data = require(__dirname + "/database.json");
    const index = req.url.split("/")[3];
    const currImg = ("image" in data[index]) ? data[index].image : "";

    popFromDatabase(index, false);
    appendToDatabase(req, currImg == "", currImg);
    res.redirect("/");
});

app.get('/edit/*', (req, res) => {
    const data = require(__dirname + "/database.json");
    const id = req.url.split("/")[2];
    const item = data[id];

    res.render(__dirname + "/pages/add.ejs", {item, id});
});

app.get('/delete/commit/*', (req, res) => {
    const index = req.url.split("/")[3];
    popFromDatabase(index, true);
    res.redirect("/");
});

app.get('/delete/*', (req, res) => {
    // this function only renders the confirmation page
    const data = require(__dirname + "/database.json");
    const id = req.url.split("/")[2];
    const name = data[id].name;

    res.render(__dirname + "/pages/delete.ejs", {id, name});
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + "/static/favicon.ico");
});

app.get('/static/*', (req, res) => {
    res.sendFile(__dirname + req.url);
});
