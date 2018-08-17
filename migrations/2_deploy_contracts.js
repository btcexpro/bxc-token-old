const BtcexToken = artifacts.require("./BtcexToken.sol");
const BtcexCrowdsale = artifacts.require("./BtcexCrowdsale.sol");
const {
    TOKEN_CAP,
    TOKEN_NAME,
    TOKEN_DECIMALS,
    TOKEN_SYMBOL,
    TOKEN_PRICE,
    START_PRESALE_TIME,
    END_TIME,
    TOKEN_SOFT_CAP,
    MIN_TRANSACTION,
} = require('../constants');

module.exports = function deploy(deployer, network, accounts) {
    console.log("TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_CAP")
    console.log(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_CAP)
    return deployer.deploy(BtcexToken, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_CAP)
        .then((tokenInstance) => {
            console.log("TOKEN_PRICE, START_PRESALE_TIME, END_TIME, TOKEN_CAP, TOKEN_SOFT_CAP, accounts[0], MIN_TRANSACTION");
            console.log(TOKEN_PRICE,
                START_PRESALE_TIME,
                END_TIME,
                TOKEN_CAP,
                TOKEN_SOFT_CAP,
                accounts[0],
                MIN_TRANSACTION);
            return deployer.deploy(
                BtcexCrowdsale,
                tokenInstance.address,
                TOKEN_PRICE,
                START_PRESALE_TIME,
                END_TIME,
                TOKEN_CAP,
                TOKEN_SOFT_CAP,
                accounts[0],
                MIN_TRANSACTION,
            );
        });
};




