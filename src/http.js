const http = require('http');
const xml2jsparser = require('xml2js').parseString;
const q = require('q');

module.exports.sendHttp = function (_data, _host, _port, _path, _auth) {
    var xmlRequest = _data;
    var options = {
        host: _host,
        port: _port,
        path: _path,
        method: 'POST',
        headers: {
            'Authorization': _auth,
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'User-Agent': 'NodeJS WinRM Client',
            'Content-Length': Buffer.byteLength(xmlRequest)
        },
    };
    var deferred = q.defer();

    var req = http.request(options, function (res) {
        if (res.statusCode < 200 || res.statusCode > 299) {
            deferred.reject('Failed to process the request, status Code: ' + res.statusCode);
        }
        res.setEncoding('utf8');
        var dataBuffer = '';
        res.on('data', function (chunk) {
            dataBuffer += chunk;

        });
        res.on('end', function () {
            xml2jsparser(dataBuffer, function (err, result) {
                if (err) {
                    deferred.reject(new Error('Data Parsing error', err));
                }
                deferred.resolve(result);
            });
        });

    });
    req.on('error', function (err) {
        console.log('error', err);
        deferred.reject(err);
    });
    if (xmlRequest) {
        req.write(xmlRequest);
    }
    req.end();

    return deferred.promise;
};