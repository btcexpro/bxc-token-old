const BtcexCrowdsale = artifacts.require("./BtcexCrowdsale.sol");
const BtcexToken = artifacts.require("./BtcexToken.sol");
const TokenStrategy = artifacts.require("./TokenStrategy.sol");

const {
    getWeiPerCentRate, getTokenPrice, START_PRESALE_TIME, END_TIME, CAP_USD, SOFT_CAP_USD,
    TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, START_TIME, TOTAL_TOKEN_SUPPLY,
} = require('../../constants');

module.exports = async (deployer, teamWallet, advisorWallet, _weiPerCent) => {
    const weiPerCent = _weiPerCent || await getWeiPerCentRate();
    const tokenPrice = await getTokenPrice(weiPerCent);
    const weiPerDollar = weiPerCent * 100;
    const goal = weiPerDollar * SOFT_CAP_USD;
    const cap = weiPerDollar * CAP_USD;
    const tokenInstance = await BtcexToken.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOTAL_TOKEN_SUPPLY);
    console.log('token deployed');
    const tokenStrategy = await TokenStrategy.new(
        START_TIME,
        weiPerCent,
        tokenPrice,
        goal,
        SOFT_CAP_USD,
    );
    console.log('tokenstrategy deployed');
    const instance = await BtcexCrowdsale.new(
        tokenStrategy.address,
        tokenInstance.address,
        tokenPrice,
        START_PRESALE_TIME,
        END_TIME,
        deployer,
        teamWallet,
        advisorWallet
    );
    console.log('crowdsale deployed');
    await web3.eth.sendTransaction({ from: deployer, value: web3.toWei('1'), to: tokenStrategy.address });
    return { weiPerCent, tokenPrice, tokenInstance, tokenStrategy, instance };
};