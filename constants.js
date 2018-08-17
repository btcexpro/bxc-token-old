const web3 = require('web3');

function toSeconds(time) {
    return Math.round(time / 1000);
}

const TOKEN_CAP = web3.utils.toWei('50000000');
const TOKEN_SOFT_CAP = web3.utils.toWei('5000000');
const TOKEN_SYMBOL = "BXC";
const TOKEN_NAME = "BtcEX";
const TOKEN_DECIMALS = 18;
const START_PRESALE_TIME = toSeconds(+new Date("09-01-2018"));
const END_PRESALE_TIME = toSeconds(+new Date("09-15-2018"));
const START_TIME = toSeconds(+new Date("09-15-2018"));
const END_TIME = toSeconds(+new Date("10-15-2018"));
const MIN_TRANSACTION = web3.utils.toWei('0.1');
// const TOKEN_PRICE = web3.utils.toWei('0.001');
const TOKEN_PRICE = 1000;


module.exports = {
    TOKEN_CAP,
    TOKEN_NAME,
    TOKEN_DECIMALS,
    TOKEN_SYMBOL,
    START_TIME,
    END_TIME,
    START_PRESALE_TIME,
    END_PRESALE_TIME,
    TOKEN_SOFT_CAP,
    MIN_TRANSACTION,
    TOKEN_PRICE,
};