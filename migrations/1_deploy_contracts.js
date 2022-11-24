let Account = artifacts.require("Account")

module.exports = function(deployer){
    //deploying contracts
    deployer.deploy(Account);
}