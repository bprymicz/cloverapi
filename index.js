var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var _ = require('lodash');
var server = require('http').createServer(app);
var requestLib = require('request');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

var routes = require('./routes.js')(app);

//app.post('/webhook', function(request, response) {
//  console.log('webhook: ', JSON.stringify(request.body));
//  response.send('thanks')
//});

//sandbox
//var CLOVER_HOST = 'pisandbox.dev.clover.com';
//var CLOVER_URL = 'apisandbox.dev.clover.com/v3/merchants/9T3MQ58S3C1JT', //sandbox:
//var CLOVER_AUTH ='Bearer cd260d48-7c10-f3e6-7b01-35e84323d25a'


//dev account
var CLOVER_HOST = 'api.clover.com';
var CLOVER_URL = 'api.clover.com';
var CLOVER_AUTH = 'Bearer 2e93a7c8-8488-afba-b485-f7724759507a'; //'Bearer 905312bf-99ae-a494-4ff4-f5390cfe63d2';


//https://api.clover.com:443/v3/merchants/NATHK6XKV2BF4/items?access_token=
app.get('/taps', function(request, response) {
  var options = {
    port: 443,
    host: CLOVER_URL,
    path: '/v3/merchants/NATHK6XKV2BF4/items?expand=tags%2Ccategories&limit=1000', // dev acct
    method: 'GET',
    headers: {
      'Authorization': CLOVER_AUTH,
      'Accept-Encoding': 'gzip',
      'Cache-Control': {'max-age': 0},
      'Host': CLOVER_HOST,
      'Content-type': 'application/json'
    }
  };
  var req = https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });
    res.on('end', function() {
      //console.log(chunked);
      console.log('No more data in response.')
    });
    res.on('end', function() {
      var buffer = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          if (decoded && decoded.toString()) {
            var resp = JSON.parse(decoded.toString());
            filterByCategory(resp,'Draft Beer', function (data){
              response.send(data);
            });
          }
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          if (decoded && decoded.toString()) {
            var resp = JSON.parse(decoded.toString());
            filterByCategory(resp,'Draft Beer', function (data){
              response.send(data);
            });
          }
        })
      } else {
        response.send(buffer.toString());
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    response.send({error: e});
  });

  req.end();
});


app.get('/widget', function(req,resp) {

  var options = {
    port: 443,
    uri: 'https://' + CLOVER_URL + '/v3/merchants/NATHK6XKV2BF4/items?expand=tags%2Ccategories&limit=1000&access_token=2e93a7c8-8488-afba-b485-f7724759507a', // dev acct
    method: 'GET'
  };
  var params = req.query;

  requestLib.get(options, function(err,httpResponse,body){
    var data = JSON.parse(body);
    var category = params.category ? params.category : 'all';
    resp.write('<div><ul>');
    if (category === 'all') {
      data.elements.forEach(function (matches){
        respondBeer(matches, function (display) {
          resp.write(display);
        });
      });
    } else {
      filterByCategory(data, category, function (matches){
        respondBeer(matches, function (display) {
          resp.write(display);
        });
      });
    }
    resp.write('</ul></div>');

  }).on('response', function(response) {
      console.log(response.statusCode) // 200
      console.log(response.headers['content-type']) // 'image/png'
    });

});

function respondBeer(beers, cb) {
  var data_beers = _.sortBy(beers, function(aBeer) {
    return aBeer.name;
  });
  data_beers.forEach(function (beer){
    var beerText = '';
    if (beer.tapNumber) {
      beerText = '<li>' + beer.tapNumber + ' ' + beer.beerName + '</li>'
    }
    cb(beerText);
  })
}

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function filterByCategory(data, category, cb) {
  var matches = [];
  data.elements.forEach(function(item) {
    if (item.categories) {
      var index = _.findIndex(item.categories.elements, function(o) { return o.name == category });
      var tapNumber = item.name.substr(0, 2);
      item.beerName = item.name.substr(3);

      if (Number(tapNumber)) {
        item.tapNumber = Number(tapNumber);
      }
      if (index >= 0 && item.stockCount > 0) {
        matches.push(item);
      }
    }
  });
  cb(matches);
}