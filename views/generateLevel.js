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
    logging.info("generating Level...");
    var params = new Request(request).params;
    params=JSON.parse(params['value']);

    var levelName=params;

    logging.info("Generating "+levelName);

    return {
      status: 200,
      headers: {"Content-Type": "application/json"},
      body: ["null"]
    };
}
