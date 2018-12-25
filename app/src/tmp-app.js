
var app = angular.module("solvethDapp", ['ngRoute']);

const formatTimestamp = (t) => {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(Number(t));
    return d;
};

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
                        result[3] = "Commited by " + result[5] + " on " + formatTimestamp(result[6]);
                    } else if (result[3] == 2) { // Solved
                        result[3] = "Solved: " + result[7];
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
