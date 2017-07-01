// SHA3 like in Solidity
var cache = [
    '',
    ' ',
    '  ',
    '   ',
    '    ',
    '     ',
    '      ',
    '       ',
    '        ',
    '         '
];

function leftPad (str, len, ch) {
    // convert `str` to `string`
    str = str + '';
    // `len` is the `pad`'s length now
    len = len - str.length;
    // doesn't need to pad
    if (len <= 0) return str;
    // `ch` defaults to `' '`
    if (!ch && ch !== 0) ch = ' ';
    // convert `ch` to `string`
    ch = ch + '';
    // cache common use cases
    if (ch === ' ' && len < 10) return cache[len] + str;
    // `pad` starts with an empty string
    var pad = '';
    // loop
    while (true) {
        // add `ch` to `pad` if `len` is odd
        if (len & 1) pad += ch;
        // divide `len` by 2, ditch the remainder
        len >>= 1;
        // "double" the `ch` so this operation count grows logarithmically on `len`
        // each time `ch` is "doubled", the `len` would need to be "doubled" too
        // similar to finding a value in binary search tree, hence O(log(n))
        if (len) ch += ch;
        // `len` is 0, exit the loop
        else break;
    }
    // pad `str`!
    return pad + str;
}

// the size of a character in a hex string in bytes
var HEX_CHAR_SIZE = 4;

// the size to hash an integer if not explicity provided
var DEFAULT_SIZE = 256;

/** Encodes a value in hex and adds padding to the given size if needed. Tries to determine whether it should be encoded as a number or string. Curried args. */
var encodeWithPadding = function encodeWithPadding(size) {
    return function (value) {
        return typeof value === 'string'
            // non-hex string
            ? web3.toHex(value
                // numbers, big numbers, and hex strings
            ) : encodeNum(size)(value);
    };
};

/** Encodes a number in hex and adds padding to the given size if needed. Curried args. */
var encodeNum = function encodeNum(size) {
    return function (value) {
        return leftPad(web3.toHex(value < 0 ? value >>> 0 : value).slice(2), size / HEX_CHAR_SIZE, value < 0 ? 'F' : '0');
    };
};

/** Hashes one or more arguments, using a default size for numbers. */

var sha3 = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var paddedArgs = args.map(encodeWithPadding(DEFAULT_SIZE)).join('');
    return web3.sha3(paddedArgs, { encoding: 'hex' });
};

/** Hashes a single value at the given size. */


var sha3withsize = function sha3withsize(value, size) {
    var paddedArgs = encodeWithPadding(size)(value);
    return web3.sha3(paddedArgs, { encoding: 'hex' });
};

var sha3num = function sha3num(value) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_SIZE;

    var paddedArgs = encodeNum(size)(value);
    return web3.sha3(paddedArgs, { encoding: 'hex' });
};


// #####################################################################################################################

var app = angular.module("solvethDapp", ['ngRoute']);

app.controller("MainController", function ($scope) {
    Main.deployed().then(function (contract) {
        contract.getNumberOfProblems.call().then(function(result) {
            var numberOfProblems = result.toNumber();
            $scope.problems = [];
            for (var i = 0; i < numberOfProblems; ++i) {
                contract.getProblem.call(i).then(function(result) {
                    $scope.problems.push(result);
                    $scope.$apply();
                });
            }
            return this;
        });

        contract.getNumberOfInstances.call().then(function(result) {
            var numberOfInstances = result.toNumber();
            $scope.instances = [];
            for (var i = 0; i < numberOfInstances; ++i) {
                contract.getInstance.call(i).then(function(result) {
                    if (result[3] == 0) { // Unsolved
                        result[3] = "Unsolved"
                    } else if (result[3] == 1) { // Commited
                        result[3] = "Commited by " + result[5];
                    } else if (result[3] == 2) { // Solved
                        result[3] = "Solved: " + result[6];
                    }
                    result[2] = web3.fromWei(result[2]); // wei -> ether
                    result[1] = result[1].map(Number);
                    $scope.instances.push(result);
                    $scope.$apply();
                });
            }
            return this;
        });
        return this;
    });
});

app.controller("NewInstanceController", function ($scope) {
    $scope.loading = false;
    $scope.success = false;
    $scope.error = false;

    $scope.accounts = web3.eth.accounts;

    $scope.newInstance = function(address, contractAddress, input, reward) {
        input = input.split(' ').map(Number);
        Main.deployed().then(function(contract) {
            $scope.loading = true;
            contract.newInstance(contractAddress, input, {from: address, value: web3.toWei(reward, "ether"), gas: 2000000}).then(function(result) {
                $scope.success = true;
                $scope.loading = false;
                $scope.$apply();
            }).catch(function(e) {
                $scope.error = e;
                $scope.loading = false;
                $scope.$apply();
            });
            return this;
        });
    };
});

app.controller("NewProblemController", function ($scope) {
    $scope.loading = false;
    $scope.success = false;
    $scope.error = false;

    $scope.accounts = web3.eth.accounts;

    $scope.newProblem = function(address, contractAddress, description) {
        Main.deployed().then(function(contract) {
            $scope.loading = true;
            contract.newProblem(contractAddress, description, {from: address, gas: 200000}).then(function(result) {
                $scope.success = true;
                $scope.loading = false;
                $scope.$apply();
            }).catch(function(e) {
                $scope.error = e;
                $scope.loading = false;
                $scope.$apply();
            });
            return this;
        });
    };
});

// xors two sha-3 outputs represented as hex strings;
// returns result in same format
const xorHex = (a, b) => {
   var result = '0x';
   for (var i = 2; i < a.length; ++i) {
       var x = Number('0x' + a[i]);
       var y = Number('0x' + b[i]);
       result += web3.toHex(x ^ y)[2];
   }
   return result;
};

const computeCommitmentHash = (address, output) => {
    var result = sha3(address);
    for (var i = 0; i < output.length; ++i) {
        result = xorHex(result, sha3(output[i]));
    }
    return sha3(result);
};

// generates random 256 bits and returns as hex string.
const randomHexNumber = () => {
    var bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    var result = '0x';
    for (var i = 0; i < bytes.length; ++i) {
        var hexByte = web3.toHex(bytes[i]).slice(2);
        while (hexByte.length < 2) {
            hexByte = '0' + hexByte;
        }
        result += hexByte;
    }
    return result;
}

app.controller("SolveInstanceController", function ($scope) {
    $scope.loading = false;
    $scope.success = false;
    $scope.error = false;

    $scope.accounts = web3.eth.accounts;

    $scope.commitSolution = function(address, instanceId, output) {
        output = output.split(' ').map(Number);

        Main.deployed().then(function(contract) {
            $scope.loading = true;
            commitmentHash = computeCommitmentHash(address, output);
            contract.commitSolution(instanceId, commitmentHash, {from: address, gas: 200000}).then(function(result) {
                $scope.success = true;
                $scope.loading = false;
                $scope.$apply();
            }).catch(function(e) {
                $scope.error = e;
                $scope.loading = false;
                $scope.$apply();
            });
            return this;
        });
    };

    $scope.revealSolution = function(address, instanceId, output) {
        output = output.split(' ').map(Number);

        Main.deployed().then(function(contract) {
            $scope.loading = true;
            contract.revealSolution(instanceId, output, {from: address, gas: 200000}).then(function(result) {
                console.log(result);
                $scope.success = true;
                $scope.loading = false;
                $scope.$apply();
            }).catch(function(e) {
                $scope.error = e;
                $scope.loading = false;
                $scope.$apply();
            });
            return this;
        });
    };
});

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
    }).when('/newinstance', {
        templateUrl: 'views/newinstance.html',
        controller: 'NewInstanceController'
    }).when('/newproblem', {
        templateUrl: 'views/newproblem.html',
        controller: 'NewProblemController'
    }).when('/solveinstance', {
        templateUrl: 'views/solveinstance.html',
        controller: 'SolveInstanceController'
    }).otherwise({redirectTo: '/'});
});
