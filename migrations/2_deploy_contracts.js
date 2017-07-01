var Main = artifacts.require("./Main.sol");
var Factorization = artifacts.require("./Factorization.sol");

module.exports = function(deployer) {
    deployer.deploy(Factorization).then(function() {
        return deployer.deploy(Main).then(function() {
            return Main.deployed().then(function (contract) {
                return contract.newProblem(Factorization.address, "Find a factor of a number", {from: web3.eth.accounts[0], gas: 200000});
            });
        });
    });
};
