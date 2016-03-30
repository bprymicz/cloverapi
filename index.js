var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var _ = require('lodash');
var server = require('http').createServer(app);
var requestLib = require('request');
var moment = require('moment');

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

var currentTaps = {
  beerData: [],
  last_updated: null
};


//https://api.clover.com:443/v3/merchants/NATHK6XKV2BF4/items?access_token=
app.get('/taps', function(request, response) {
  var options = {
    port: 443,
    uri: 'https://' + CLOVER_URL + '/v3/merchants/NATHK6XKV2BF4/items?expand=tags%2Ccategories&limit=1000&access_token=2e93a7c8-8488-afba-b485-f7724759507a', // dev acct
    method: 'GET'
  };

  requestLib.get(options, function(err, httpResponse, body) {
    var data = JSON.parse(body);
    response.write(JSON.stringify(data, null, 2));

  }).on('response', function(response) {
    console.log(response.statusCode) // 200
    console.log(response.headers['content-type']) // 'image/png'
  });

});


app.get('/widget', function(req,resp) {

  var params = req.query;

  if (currentTaps.last_updated) {
    console.log('using stored data');
    var data = currentTaps.beerData;
    data.category = params.category ? params.category : 'all';
    createHTML(data, function(html) {
      console.log(html);
      resp.write(html);
    })
  } else {
    console.log('using new data');
    var options = {
      port: 443,
      uri: 'https://' + CLOVER_URL + '/v3/merchants/NATHK6XKV2BF4/items?expand=tags%2Ccategories&limit=1000&access_token=2e93a7c8-8488-afba-b485-f7724759507a', // dev acct
      method: 'GET'
    };

    requestLib.get(options, function(err, httpResponse, body) {
      var data = JSON.parse(body);
      currentTaps.last_updated = moment();
      currentTaps.beerData = data;
      data.category = params.category ? params.category : 'all';
      createHTML(data, function(html) {
        console.log(html);
        resp.write(html);
        resp.end();
      })

    }).on('response', function(response) {
      console.log(response.statusCode) // 200
      console.log(response.headers['content-type']) // 'image/png'
    });
  }


});

function createHTML(data, cb) {
  getCategoryHTML(data, function(htmlResp) {
    var html = '<div style="display: flex; flex-direction: column; flex-wrap: wrap">';
    html += htmlResp;
    html +='</div>';
    cb(html);
  });
}

function getCategoryHTML(data, cb) {
  filterByCategory(data, data.category, function (matches){
    respondBeer(matches, function (display) {
      cb(display);
    });
  });
}

function respondBeer(beers, cb) {
  var data_beers = _.sortBy(beers, function(aBeer) {
    return aBeer.name;
  });
  var beerText = '';
  data_beers.forEach(function (beer){
    if (beer.tapNumber) {
      beerText += '<div style="display: flex; flex-direction: row">' +
        '<div style="width: 40px">' + beer.tapNumber + '</div>' +
        '<div>' + beer.beerName + '</div>' +
        '</div>';
    }
  });
  cb(beerText);
}

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function filterByCategory(data, category, cb) {
  var tapSpots = {};
  data.elements.forEach(function(item) {
    if (item.categories) {
      var index = _.findIndex(item.categories.elements, function(o) { return category === 'all' || o.name == category });
      var tapNumber = item.name.substr(0, 2);
      item.beerName = item.name.substr(3);

      if (Number(tapNumber)) {
        item.tapNumber = Number(tapNumber);
      }
      if (index >= 0 && item.stockCount > 0) {
        if (!tapSpots['tap' + tapNumber] || tapSpots['tap' + tapNumber].modifiedTime > item.modifiedTime) {
          tapSpots['tap' + tapNumber] = item;
        }
      }
    }
  });
  var matches = [];
  Object.keys(tapSpots).forEach(function(tap) {
    matches.push(tapSpots[tap]);
  });
  cb(matches);
}