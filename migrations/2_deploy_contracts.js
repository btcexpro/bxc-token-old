const BtcexToken = artifacts.require("./BtcexToken.sol");
const BtcexCrowdsale = artifacts.require("./BtcexCrowdsale.sol");
const TokenStrategy = artifacts.require("./TokenStrategy.sol");
const web3 = require('web3');

const {
    getWeiPerCentRate, getTokenPrice, START_PRESALE_TIME, END_TIME, CAP_USD, SOFT_CAP_USD,
    TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, START_TIME, TOTAL_TOKEN_SUPPLY, TEAM_WALLET, ADVISOR_WALLET
} = require('../constants');

module.exports = async function deploy(deployer, network, accounts) {
    deployer.then(async () => {
        const weiPerCent = await getWeiPerCentRate();
        const tokenPrice = await getTokenPrice(weiPerCent);
        const weiPerDollar = weiPerCent * 100;
        const goal = weiPerDollar * SOFT_CAP_USD;
        const cap = weiPerDollar * CAP_USD;
        const tokenInstance = await deployer.deploy(BtcexToken, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOTAL_TOKEN_SUPPLY);
        const tokenStrategy = await deployer.deploy(
            TokenStrategy,
            START_TIME,
            weiPerCent,
            tokenPrice,
            goal,
            SOFT_CAP_USD,
        );
        // const sendTransactionTx = await web3.eth.sendTransaction({
        //     from: deployer,
        //     value: web3.toWei('1'),
        //     to: tokenStrategy.address,
        // });
        // console.log("sendTransactionTx");
        // console.log(sendTransactionTx);
        const instance = await deployer.deploy(
            BtcexCrowdsale,
            tokenStrategy.address,
            tokenInstance.address,
            tokenPrice,
            START_PRESALE_TIME,
            END_TIME,
            accounts[0],
            TEAM_WALLET,
            ADVISOR_WALLET
        );
        const tx = await tokenInstance.transferOwnershipAndTotalBalance(instance.address, { from: accounts[0] });
        console.log("tx");
        console.log(tx);
        return tokenStrategy.updatePrice();
    });
};




