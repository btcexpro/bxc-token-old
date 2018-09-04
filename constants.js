const web3 = require('web3');
const request = require('request-promise-native');

function toSeconds(time) {
    return Math.round(time / 1000);
}

const CAP_USD = 5000000;
const SOFT_CAP_USD = 1000000;
const TOTAL_TOKEN_SUPPLY = web3.utils.toWei('50000000');
const TOKENS_FOR_PRESALE = web3.utils.toWei('15000000');
const TOKENS_FOR_SALE = web3.utils.toWei('15000000');
const TOKENS_FOR_INCENTIVES = web3.utils.toWei('13000000');
const TOKENS_FOR_TEAM = web3.utils.toWei('6000000');
const TOKENS_FOR_ADVISORS = web3.utils.toWei('1000000');
const TOKENS_FOR_BOUNTY = web3.utils.toWei('1000000');
const TOKEN_SYMBOL = "BXC";
const TOKEN_NAME = "BtcEX";
const TOKEN_DECIMALS = 18;
const START_PRESALE_TIME = toSeconds(+new Date("09-05-2018"));
const START_TIME = toSeconds(+new Date("09-10-2018"));
const END_TIME = toSeconds(+new Date("09-20-2018"));
// const START_PRESALE_TIME = toSeconds(+new Date("10-01-2018"));
// const START_TIME = toSeconds(+new Date("10-15-2018"));
// const END_TIME = toSeconds(+new Date("11-15-2018"));
const MIN_TRANSACTION = web3.utils.toWei('0.1');
const TOKEN_PRICE_USD = 0.25;
const CENTS_PER_WEI = TOKEN_PRICE_USD * 100;
// const TOKEN_PRICE = web3.utils.toWei('0.001');
const getWeiPerCentRate = async () => {
    const response = await request(
        {
            uri: 'https://api.gdax.com/products/ETH-USD/ticker',
            headers: {
                'User-Agent': 'Request-Promise',
            },
            json: true // Automatically parses the JSON string in the response
        },
    );
    return web3.utils.toWei('1') / (parseFloat(response.price) * 100);
    // return web3.utils.toWei('1') / (parseFloat("268.99000000") * 100);
};

const TEAM_WALLET = '0xdee4048b9da8a7a5f01e66a2ba578503d6f91697';
const ADVISOR_WALLET = '0x2eb17927e17668026b2225a7810928f510c57012';

function getTokenPrice(centPerWei) {
    return centPerWei * CENTS_PER_WEI;
}


module.exports = {
    CAP_USD,
    TOKEN_NAME,
    TOKEN_DECIMALS,
    TOKEN_SYMBOL,
    START_TIME,
    END_TIME,
    SOFT_CAP_USD,
    MIN_TRANSACTION,
    getWeiPerCentRate,
    getTokenPrice,
    START_PRESALE_TIME,
    TOKENS_FOR_PRESALE,
    TOKENS_FOR_SALE,
    TOKENS_FOR_TEAM,
    TOKENS_FOR_ADVISORS,
    TOKENS_FOR_INCENTIVES,
    TOKENS_FOR_BOUNTY,
    TOTAL_TOKEN_SUPPLY,
    TEAM_WALLET,
    ADVISOR_WALLET
};