var Main = artifacts.require("./Main.sol");
var Factorization = artifacts.require("./Factorization.sol");
var TravellingSalesman = artifacts.require("./TravellingSalesman.sol");

module.exports = function(deployer) {
  deployer.deploy(Factorization).then(function() {
    return deployer.deploy(TravellingSalesman).then(function() {
      return deployer.deploy(Main).then(function() {
        return Main.deployed().then(function(contract) {
          return contract
            .newProblem(Factorization.address, {
              from: web3.eth.accounts[0],
              gas: 200000
            })
            .then(function(result) {
              return contract
                .newProblem(TravellingSalesman.address, {
                  from: web3.eth.accounts[0],
                  gas: 200000
                })
                .then(function(result) {
                  return contract.newTask(0, [30], {
                    from: web3.eth.accounts[0],
                    gas: 200000,
                    value: 1000000000
                  });
                })
                .then(function(result) {
                  return contract.newTask(0, [58], {
                    from: web3.eth.accounts[0],
                    gas: 200000,
                    value: 2000000000
                  });
                })
                .then(function(result) {
                  return contract.newTask(1, [100], {
                    from: web3.eth.accounts[0],
                    gas: 200000,
                    value: 10000000000
                  });
                });
            });
        });
      });
    });
  });
};
