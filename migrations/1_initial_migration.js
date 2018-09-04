var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer, newtork, accounts) {
    deployer.deploy(Migrations);

};
