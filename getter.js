var request = require('request');

exports.post = function(url, params, callback){
  request.post(url, {form: params }, function(error, response, body){
    if (!error && response.statusCode == 200) {
      callback(null,body);
    }
  });
};

exports.get = function(url, callback){
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null,body)
    }
  })
}
