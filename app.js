var express = require('express'),
    bodyParser = require('body-parser');

const port = 9002;
var app = express();
app.use(bodyParser.json());


app.get('/getQHMentors', function (req, res, next) {
    let data = ['Biplab Karki', 'Kshitiz Mandal', 'Marvin Heng', 'Juice'];
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server running at :${port}/`);
});