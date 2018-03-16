var ChainList = artifacts.require("./Chainlist.sol");

module.exports = function(deployer) {
    deployer.deploy(ChainList);
};
