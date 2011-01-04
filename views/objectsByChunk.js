var Request = require("ringo/webapp/request").Request
var logging = require("google/appengine/logging")

exports.app = function (request) {
    return exports[request.method](request);
}

exports.GET = function (request) {
    logging.info("view get...");
    var params = new Request(request).params
    logging.info("params: "+JSON.stringify(params));

    return {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: ["null"]
    };
}

exports.POST = function (request) {
    logging.info("view post...");
    var params = new Request(request).params
    logging.info("params: "+JSON.stringify(params));

    params=JSON.parse(params['value']);
    logging.info("params: "+JSON.stringify(params));

    if(params['type']=='object')
    {
      var chunkX=params['chunkX'];
      var chunkY=params['chunkY'];
      var chunkId=chunkX+'_'+chunkY;

      logging.info("object");

      return {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: ["{\"key\": \""+chunkId+"\", \"value\": "+JSON.stringify(params)+"}"]
      };
    }
    else
    {
      logging.info("not object");
      return {
        status: 200,
        headers: {"Content-Type": "application/json"},
        body: ["null"]
      };
    }
}
