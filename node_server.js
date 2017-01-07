var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+ '/valid_address.html'));
});
app.listen(8080);
console.log("listening on 8080!");
