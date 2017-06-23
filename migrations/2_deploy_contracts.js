var Main = artifacts.require("./Main.sol");
var Factorization = artifacts.require("./Factorization.sol");

module.exports = function(deployer) {
  deployer.deploy(Factorization).then(function() {
    return deployer.deploy(Main, Factorization.address, "Find a factor of a number");
  });
};
