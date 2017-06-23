var Factorize = artifacts.require("./Main.sol");

contract('Main', function(accounts) {
    var user_address = web3.eth.accounts[0];

    var checkBalance = function(address, etherBalance) {
        return web3.eth.getBalance(address) == web3.toWei(etherBalance, "ether");
    };

    it('adding new task', function() {
        return Factorize.deployed().then(function(instance) {
            return instance.newTask(15, {from: user_address, value: web3.toWei(3, "ether")}).then(function() {
            }).then(function() {
                return instance.getNumberOfTasks();
            }).then(function(numberOfTasks) {
                assert.equal(numberOfTasks.toNumber(), 1, "wrong number of tasks");
            }).then(function() {
                return instance.getTask(0);
            }).then(function(result) {
                var n = result[0].toNumber();
                var reward = web3.fromWei(result[1].toNumber(), "ether");
                var solved = result[3];
                assert.equal(n, 15, "wrong number to factorize");
                assert.equal(reward, 3, "wrong reward");
                assert.equal(solved, false, "task must be marked unsolved at the beginning");
                assert(checkBalance(instance.address, 3), "wrong contract balance");
            })
        });
    });

    it('solving a task', function() {
        return Factorize.deployed().then(function (instance) {
            var contract_balance = web3.fromWei(web3.eth.getBalance(instance.address), "ether").toNumber();
            return instance.newTask(15, {from: user_address, value: web3.toWei(3, "ether")}).then(function() {
            }).then(function() {
                return instance.solveTask(0, 5, {from: user_address});
            }).then(function() {
                return instance.getTask(0);
            }).then(function(result) {
                assert.equal(result[3], true, "task must be marked solved now");
                assert(checkBalance(instance.address, contract_balance), "wrong contract balance");
            })
        });
    });
});
