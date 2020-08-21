var http = require('http');
var formidable = require('formidable');
var fs = require('fs');



http.createServer(function(req, res) {
    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var oldpath = files.filetoupload.path;
            var newpath = 'C:/Users/localuser/content/' + files.filetoupload.name;
            fs.rename(oldpath, newpath, function(err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();

                setTimeout(function() {
                    window.alert = null;
                    delete window.alert;
                    window.alert("File upload complete!");
                    window.location.replace("127.0.0.1/8080")
                }, 5000);


            })
        });
    } else {

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(8080);


function splashPage() {

}

function redirect() {

}