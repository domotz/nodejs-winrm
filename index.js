const q = require('q');
let shell = require('./src/shell.js');
let command = require('./src/command.js');

module.exports = {
    shell: shell,
    command: command
};

module.exports.runCommand = function (_command, _host, _username, _password, _port, _usePowershell) {

    var deferred = q.defer();
    try {

        var auth = 'Basic ' + Buffer.from(_username + ':' + _password, 'utf8').toString('base64');
        var params = {
            host: _host,
            port: _port,
            path: '/wsman',
        };
        params['auth'] = auth;
        shell.doCreateShell(params).then(function (shellId) {
            params['shellId'] = shellId;

            params['command'] = _command;
            var commandExecution;
            if ( _usePowershell ) {
                commandExecution = command.doExecutePowershell(params);
            } else {
                commandExecution = command.doExecuteCommand(params);
            }
            commandExecution.then(function (commandId) {
                params['commandId'] = commandId;
                command.doReceiveOutput(params).then(function (output) {
                    deferred.resolve(output);
                    shell.doDeleteShell(params)
                });
            });
        });
    } catch (error) {
        console.log('error', error);
        deferred.reject(error);
    }
    return deferred.promise;
};

module.exports.runPowershell = function (_command, _host, _username, _password, _port) {
  return module.exports.runCommand(_command, _host, _username, _password, _port, true);
}
