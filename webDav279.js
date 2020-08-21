const { createClient } = require("webdav");
const http = require('http')
const fs = require('fs');
const { stringify } = require("querystring");
const { resolve } = require("path");
// const bcrypt = require('./custom-bycrypt.js')
const vault = require("node-vault");
const nodemailer = require('nodemailer')


//Client Information
location = 279;
//cloud file location
const url = `/ContentPlayers/${location}`
    //Local directory: C:\Users\LocalUser\Videos\Primary

// Local UrL is the directories that need to be validated before a comparison can be made
const localUrl = ["\\Users/LocalUser/Videos/Primary", ]



class Translation {
    constructor(cloudVersion, localVersion, client, pass, loc, localItems, cloudItems, localSize, localobj) {
        this.cloudVersion = cloudVersion;
        this.localVersion = localVersion;
        this.client = client;
        this.pass = pass;
        this.loc = loc;
        this.localItems = localItems;
        this.cloudItems = cloudItems;
        this.localSize = localSize;
        this.localobjs = localobj;
        this.fileTypes = [".mp3", ".avi", ".png", ".mp4", ".ASF", ".wav", ".flac", ".mpeg-2", ".jpg", ".mp4"];
        this.mailobjs = [];
        this.mail = [];
    }

    comparison(item1, item2) {
        let x = item1 - item2
        let y = x / 86400000
        let z = y.toFixed(2);
        console.log(`${item1} VS ${item2}`)
        console.log(`The local version is ${z} Days old`);
        return z;



    }



    validate() {
        const target = createClient(
            "https://costleyentertainment.com/projects/dav/fileserver.php/private", {
                username: "****",
                password: "****"
            }
        );

        return target

    }


    //Cleans outdated files - if file has not been modified in 60 days, and does not exist on the cloud server - delete.
    garbageCollection() {}

    //System Notifications
    smtpNotify() {

    }

    async eC(err, dir) {
        //Local
        console.log(err.code);
        if (err.code === "ENOENT") {
            console.log(`Creating new Directory....`);
            console.log(dir);

            //Creation method for the local File System, Requires Admin rights to modify. Additional file information may be required
            //This method doesn't chain into another method as the settimeout method on the initilization assumes a 5 second window for pass/fail
            //see below in the root file for the .then() promise that invokes the following local sync method.
            await fs.mkdir(dir, { recursive: true }, (err) => {
                console.log(err);
                console.log(`Directory Create: ${dir} === Completed`);


            })
        } else {
            console.log(`Directory Creation Failed, please contact support`);
            newVid.mailobjs.push(`The following error has occured on player ${location}, in the directory creation. See error: ${err}`)
        }


    }


    ///async methods
    //checks the directory for the version and size of files
    async localStats() {
        //Helper method for determining files within the directory, and any relevent information regarding the local data
        //Do final Check for last item in our LocalSys array *Our Root Directory for File Placement and Comparison

        //localArray - Looks at the highest level for creation, and then determines contents to check against the Cloud WEBDAV server for necessary Changes.
        let localArray = newVid.localItems.length - 1
            //console.log(newVid.localItems)
        let localItem = newVid.localItems[localArray]
        fs.stat(localItem, function(err, stats) {
            if (err) {

                //Kick out, and will indicate failure in the event the root directory cannot be located. If populating additional items
                //within the newVid.local items array, be sure to add to the front of the array, as this checks the last item.
                console.log(`Local File System Check Completed.... FAILED. Error: ${err}`)
            } else {

                //Converting the Object data to a string for testing
                //let obj = JSON.stringify(stats)
                //console.log(obj);
                console.log(`Local File System Check Completed. Local directory exists: ${stats.isDirectory()}. Directory Name: ${newVid.localItems[localArray]}`)
                let loop = [stats.ctime];
                console.log(`The Local Directory File size: ${stats.size}`)
                newVid.localSize = stats.size
                console.log(`The Local Directory was last modified: ${stats.ctime}`)



                fs.readdir(localItem, function(err, data) {
                    console.log(`Local Files Found: ${data}`)
                    console.log(err);
                    let line = data.forEach((key, index) => {
                        //Takes the local Directory - Localurl, and adds it to the file name. specified as a key
                        let merge = `${localUrl}/${key}`;

                        //Pulls the local file information
                        let datas = fs.statSync(merge);

                        //pushes the merged information into the obj. to be compared against cloud items
                        newVid.localobjs.push(datas);

                        //Adds the key to the specific objects for later references
                        newVid.localobjs[index].name = key;
                        newVid.localobjs[index].localpath = merge

                        //Checks for current valid filetypes, and then populates the media val accordingly
                        newVid.fileTypes.forEach((type) => {
                            //console.log(`THE TYPE: ${type}`);
                            let localstr = `${merge}`
                            if (localstr.includes(type)) {
                                console.log(`Valid Filetype`);
                                newVid.localobjs[index].media = true;
                            } else newVid.localobjs[index].media = false;
                        });
                        return datas
                    });
                    const fileSizeInBytes = line
                    let con = JSON.stringify(newVid);
                    //console.log(`Current Objs for each item - ${con}`)
                    console.log(newVid);

                })


            }



        })
    }

    //METHOD COMPLETE - FOR NOW
    async local(dir) {
        console.log(`Locating Local Directories.... ${dir[0]} + ${dir[1]} ${dir[2]}`)
            // A loop is not required here - at this stage. A single Directory will house the information needed to complete the transfer
            //Adding the loop support extended directory creation
            //If additional items are added to the array - the root directory will need to be at the end of the list otherwise the helper method
            //newVid.localStats() will need to be modified.
        for (let i = 0; i < dir.length; i++) {

            //fs.stat <-- file system check for [dir] Specified directories
            // Directories required:
            // C:/LocalUser
            // C:/
            //console.log(`I RAN ${i} `)
            fs.stat(dir[i], function(err, stats) {
                if (err) {
                    //kick out  for problems and Directory Creation
                    console.log(`ERROR - System Stop. Error Code: ${err}`);

                    //Porting of variables. 1)Error Code
                    //Error Code - ENOENT (Will Create a new Dir)
                    //Error Code - EPERM - Run as Admin, or modify folder permissions
                    newVid.eC(err, dir[i]);
                } else {



                    if (stats.isDirectory() === true) {
                        //Checks that specified item is a directory.
                        console.log(stats.isDirectory());
                    }
                    //
                    return
                }
            })
        }
    }

    //WORK IN PROGRESS
    async cloudCheck() {


        let client = newVid.validate();

        if (this.loc != null || undefined) {
            const directoryItems = await client.getDirectoryContents(this.loc)
            if (await client.exists(`${this.loc}`) === false) {
                console.log(`Location does not exist`);
            }

            //Helper
            console.log(`Line 216 - ${JSON.stringify(directoryItems)}`);

            //helper
            //Confirms Total Objects
            //console.log(directoryItems.length)

            //Loops over iterable items
            //The Target is a directory. "Primary"
            //We only want to download items within Primary
            let key = 0
            for (key in directoryItems) {
                console.log(key)
                let b = this.loc;
                let c = directoryItems[key].filename;
                console.log(`${b} and the name is: ${c}`)
                console.log(directoryItems[key].lastmod)
                let cloudV = directoryItems[key].lastmod;
                let x = Date.parse(cloudV);

                newVid.localobjs.forEach((item) => {
                    if (c.includes(item.name)) {
                        console.log(`File Match: Local file: ${item.name} matches cloud file: ${c}`)
                        console.log(`${c}`);
                        let lastmod = item.mtime
                        let y = Date.parse(lastmod);
                        let con = newVid.comparison(x, y)
                        console.log(`Line 250 - ${con}`)
                    }


                })


                //Obj Method for confirming variance


                let a = newVid.comparison(this.cloud, this.version);
                console.log(`Math Computed: ${a}`)
                if (a === "null" || "NaN") {


                    //Current path has directories within reference point
                    // REFACTOR THIS LATER
                    if (directoryItems[key].type != 'directory') {
                        console.log(`No Matches found + Queue Download `)
                        let localArray = newVid.localItems.length - 1;
                        let localfileName = directoryItems[key].basename;
                        let path = `${newVid.localItems[localArray]}/${localfileName}`;
                        console.log(path);
                        console.log(c);
                        console.log(newVid.fileTypes);

                        // Okay, I hope this works
                        //console.log(testVar)
                        //await client.copyfile(path, tempPath);
                        newVid.fileTypes.forEach(function(element) {
                            if (localfileName.includes(element)) {
                                console.log(`We work!`)
                            } else return
                        })
                        await client.createReadStream(c, { encoding: 'utf8' })
                            .on('readable', function(data) {
                                console.log(`New Stream found. File ${localfileName} is now downloading ${data}`)
                                newVid.mailobjs.push(`Downloadable item: ${localfileName}`);

                            })
                            .on("end", function(data) {
                                console.log(`Download Complete`);
                                newVid.mailobjs.push(`The following File: ${localfileName} was downloaded to ${location}`);
                            })
                            .on("error", function(err) {
                                console.log(`ERROR - the following file failed to download: ${localfileName}`)
                                newVid.mailobjs.push(`The following File: ${localfileName} FAILED to download to player ${location} - ${err}`);
                            })
                            .pipe(fs.createWriteStream(path));
                    };




                    //launch the download

                } else if (a < 1) {

                }


            }

            return directoryItems
        } else {
            console.log(`newVid: ${this.loc}`);
        }

    }

    async download(obj) {

    }


}


// New Stream
let newVid = new Translation(0, 0, 0, 0, url, localUrl, [], 10, []);


//Initialization --- Checks the local system contents; once complete - it launches the WEBDAV Stream to start the key/match process

newVid.local(localUrl)
    .then(() => {

        newVid.localStats()

        //5 Second Timer for Local File System Creation/Check
        setTimeout(() => {


            newVid.cloudCheck().catch((err) => {
                console.log(err)
            });
            //resolve();
            console.log(`COMPLETED`)
                //LET THE CHAINING CONTINUE
        }, 5000)
    }).then(() => {
        setTimeout(() => {

            //60 Second Timer for Mailer
            //notify(newVid)
            //resolve();
            console.log(`COMPLETED`)
            let mail = JSON.stringify(newVid.mailobjs);
            console.log(mail);
            //LET THE CHAINING CONTINUE
        }, 30000)
    })




// async..await is not allowed in global scope, must use a wrapper
async function notify(newVid) {


    console.log(newVid.mailobjs)
    let mail = JSON.stringify(newVid.mailobjs);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'mail.costleyentertainment.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'content@costleyentertainment.com', // generated  user
            pass: '**' //  password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Content 👻" <support@costleyentertainment.com>', // sender address
        to: 'support@costleyentertainment.com', // list of receivers
        subject: `Content ✔ - store ${location} has updated`, // Subject line
        text: JSON.stringify(newVid.mailobjs), // plain text body
        html: '<b>Hello world, I am Computron</b>' // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>


}