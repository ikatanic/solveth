var app = angular.module("factorizeDapp", ['ngRoute']);

app.controller("MainController", function ($scope) {
    Factorize.deployed().then(function (contract) {
        contract.getNumberOfTasks.call().then(function(result) {
            var numberOfTasks = result.toNumber();
            $scope.tasks = [];
            for (var i = 0; i < numberOfTasks; ++i) {
                contract.getTask.call(i).then(function(result) {
                    if (!result[4]) {
                        result[2] = web3.fromWei(result[2], "ether").toNumber();
                        $scope.tasks.push(result);
                        $scope.$apply();
                    }
                });
            }
            return this;
        });
        return this;
    });
});

app.controller("NewTaskController", function ($scope) {
    $scope.loading = false;
    $scope.success = false;
    $scope.error = false;

    $scope.accounts = web3.eth.accounts;

    $scope.newTask = function(address, n, reward) {
        Factorize.deployed().then(function(contract) {
            $scope.loading = true;
            contract.newTask(n, {from: address, value: web3.toWei(reward, "ether"), gas: 200000}).then(function(result) {
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

app.controller("SolveTaskController", function ($scope) {
    $scope.loading = false;
    $scope.success = false;
    $scope.error = false;

    $scope.accounts = web3.eth.accounts;

    $scope.solveTask = function(address, task_id, factor) {
        Factorize.deployed().then(function(contract) {
            $scope.loading = true;
            contract.solveTask(task_id, factor, {from: address, gas: 200000}).then(function(result) {
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
    };});

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
    }).when('/newtask', {
        templateUrl: 'views/newtask.html',
        controller: 'NewTaskController'
    }).when('/solvetask', {
        templateUrl: 'views/solvetask.html',
        controller: 'SolveTaskController'
    }).otherwise({redirectTo: '/'});
});
