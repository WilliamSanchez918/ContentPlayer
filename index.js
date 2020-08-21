const express = require("express")
const partials = require('express-partials');
const path = require("path")
const multer = require("multer")
const app = express()
const { createClient } = require("webdav");
const fs = require('fs');
const { checkServerIdentity } = require("tls");
const { response } = require("express");


//Global Class for loading init files (may add a wait for loading later date)
//To reference JSON Object files: loader.sync.sync <- loader is class / sync is local obj val / sync is the key for keypair
class Globals {
    constructor(sync, checked, update) {
        this.sync = sync
        this.checked = checked
        this.update = update
    }
    init() {
        this.checked = ""
        fs.readFile('config.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return
            }
            console.log(data)
            let temp = JSON.parse(data);
            this.sync = temp.sync;
            this.update = temp.update;
            if (this.sync == "true") {
                this.checked = "checked";
            }


            console.log(`The Loader Object Values: ${JSON.stringify(loader)}`);
            console.log(`the value of the sync is: ${this.sync}`);

            return data;
        });
    }
}

let loader = new Globals()
loader.init()


// Local UrL is the directories that need to be validated before a comparison can be made
const localUrl = ["\\Users/LocalUser/Videos/Primary", ]

//static routes
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'icons')));



// View Engine Setup 
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(partials());

// var upload = multer({ dest: "Upload_folder_name" }) 
// If you do not want to use diskStorage then uncomment it 

var storage = multer.diskStorage({
    destination: function(req, file, cb) {

        // Uploads is the Upload_folder_name 
        cb(null, "uploads")
    },
    filename: function(req, file, cb) {

        //EXTENSION HANDLER
        let datas = '.jpg'
        if (file.originalname.includes(`.png`)) {
            datas = ".png"
        }
        if (file.originalname.includes(`.jpg`)) {
            datas = ".jpg"
        }
        if (file.originalname.includes(`.mp4`)) {
            datas = '.mp4'
        }
        if (file.originalname.includes(`.jpg`)) {
            datas = '.jpeg'
        }

        //
        //let fileType = datas
        cb(null, file.fieldname + "-" + Date.now() + datas)
    }
})

// Define the maximum size for uploading 
// picture i.e. 1 MB. it is optional 
const maxSize = 1 * 100000 * 100000;




var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function(req, file, cb) {

        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png|mp4/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the " +
            "following filetypes - " + filetypes);
    }

    // mypic is the name of file attribute 
}).single("content");


//ROUTES


//HOME
app.get("/", function(req, res) {
        let localDownloads = [1, 2, 3]

        //console.log(loader.sync.sync)

        fs.readdir(__dirname + '/uploads', function(err, data) {
            console.log(data);
            console.log(err);


            localDownloads = data;

            let checked = loader.checked

            res.render("Signup", { localDownloads: localDownloads, checked: checked });

        })


    })
    //CONFIG
app.get("/config", function(req, res) {


    let checked = loader.sync
    let update = loader.update

    console.log(loader.update)

    res.render("config", { checked: checked, update: update });
})

//Delete Items - Confirmation Page
app.get("/delete/:item", function(req, res) {
        let response = req.params.item;

        res.render("download", { item: response });
    })
    //Delete Items - Final
app.get("/delete/yes/:item", function(req, res) {
    let response = req.params.item;
    let uri = __dirname + `/uploads/${response}`
    fs.unlink(uri, function(req, res) {
        console.log(req);
        console.log(res);
    })
    res.redirect('/');
})

app.get("/config/apply/:item", function(req, res) {
        let response = req.params.item;

        let variables = response.split("&")
            //Cloud Sync
        let a = variables[0];

        //Frequency Setting
        let b = variables[1]
        console.log(response)
        let settings = { "sync": `${a}`, "update": `${b}` }

        //update obj
        loader.sync = a;
        loader.update = b;

        if (loader.sync == "true") {
            loader.checked = "checked";
        } else loader.checked = ""
        console.log(`loader obj new values: ${loader}`)

        fs.writeFile('config.json', JSON.stringify(settings), (err) => {
            if (err) throw err;
        })
        console.log(`Config File Updated! - ${JSON.stringify(settings)}`)

        res.redirect('/config')
    })
    //Upload Items - Checks to see if cloud sync is enabled based on JSON Config File
app.post("/upload", function(req, res, next) {

    // Error MiddleWare for multer file upload, so if any 
    // error occurs, the image would not be uploaded! 
    upload(req, res, function(err) {

        if (err) {

            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err)
        } else {

            // SUCCESS, image successfully uploaded 
            res.redirect('/');

            // let cloud = loader(cb);
            //Add Toggle for Cloud Sync
            console.log(`Sync Status: ${loader.sync.sync}`)
            if (loader.sync.sync == true) {
                uploads(req);
            } else console.log(`Cloud Sync Disabled`);

        }
    })
})

// Take any port number of your choice which 
// is not taken by any other process 
app.listen(8080, function(error) {
    if (error) throw error
    console.log("Server created Successfully on PORT 8080")
})




// Cloud Sync - Web DAV service
async function uploads(req) {
    const client = createClient(
        "https://costleyentertainment.com/projects/dav/fileserver.php/private", {
            username: "***",
            password: "***"
        })


    location = 279;
    //cloud file location
    const url = `/ContentPlayers/${location}`
        //Local directory: C:\Users\LocalUser\Videos\Primary
    const directoryItems = await client.getDirectoryContents(`${url}`);

    //console.log(directoryItems);

    // if (client.exists(url)) {
    //     const directoryItems = await client.getDirectoryContents(url)
    //     if (await client.exists(`${url}`) === false) {
    //         console.log(`Location does not exist`);
    //     }
    // } else console.log(`Error`)



    await fs.createReadStream(req.file.path, { encoding: 'UTF-8' })
        .on('readable', function(data) {
            //console.log(req)
            var imageData = fs.readFileSync(req.file.path)
            console.log(`New Stream found. File ${req.file.path} is now uploading`)
                //client.putFileContents(`${req.file.path}`, url, { overwrite: false })
            client.putFileContents(req.file.filename, imageData, {
                format: "binary",
                overwrite: true,
                onUploadProgress: progress => {
                    console.log(`Uploaded ${progress.loaded} bytes of ${progress.total}`);
                }
            });

        })
        .on("end", function(data) {
            console.log(`Download Complete`);
        })
        .on("error", function(err) {
            console.log(`ERROR - the following file failed to download: ${err}`)
        })
        .pipe(client.createWriteStream(`${url}`));
}

//Initial Params for file activities