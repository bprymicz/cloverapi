var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/webhook', function(request, response) {
  console.log('webhook: ', JSON.stringify(request.body));
  response.send('thanks')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});