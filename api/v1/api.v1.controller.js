'use strict';
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var _ = require('lodash');

module.exports = {
  get: get
};

//https://api.clover.com:443/v3/merchants/NATHK6XKV2BF4/items?access_token=2e93a7c8-8488-afba-b485-f7724759507a

// GET request
function get(request, response) {
  //var parsedPath = request(req.params[0], req.method.toLowerCase());
  console.log('wtf');
  var options = {
    host: 'api.clover.com',
    port: 443,
    path: '/v3/merchants/NATHK6XKV2BF4/items',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer 2e93a7c8-8488-afba-b485-f7724759507a',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, sdch',
      'Cache-Control': {'max-age': 0},
      'Host': 'api.clover.com',
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
          response.send(decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          response.send(decoded && decoded.toString());
        })
      } else {
        response.send(buffer.toString());
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();
}

function pathParser(pathParam, method) {
  var obj = {};
  var path = pathParam.split('/');
  var network = path[0];
  method = method === 'delete' ? 'destroy' : method;
  switch (path[1]) {
    case 'custom':
      path.splice(0, 2).join('/');
      obj = {
        routingKey: network + '.custom.' + method,
        resource: path.join('/'),
        network: network
      };
      return obj;
      break;
    default:
      path.splice(0, 1);
      obj = {
        routingKey: network + '.standard.' + method,
        resource: path.join('/'),
        network: network
      };
      return obj;
  }
}
