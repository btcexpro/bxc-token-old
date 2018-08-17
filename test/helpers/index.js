function getDaysInSeconds(days) {
    return 86400 * days;
}

function calculatePercentBonusByDate(blockTimestamp, startPreSale) {
    if (blockTimestamp > startPreSale + getDaysInSeconds(15)) {
        return 0;
    } else if (blockTimestamp > startPreSale + getDaysInSeconds(12)) {
        return 2.5;
    } else if (blockTimestamp > startPreSale + getDaysInSeconds(9)) {
        return 5;
    } else if (blockTimestamp > startPreSale + getDaysInSeconds(6)) {
        return 10;
    } else if (blockTimestamp > startPreSale + getDaysInSeconds(3)) {
        return 15;
    } else {
        return 20;
    }
}

function getDiffInDays(endDate) {
    const date1 = new Date();
    const date2 = endDate;
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Increases testrpc time by the passed duration in seconds
function increaseTime(duration) {
    const id = Date.now();

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id: id,
        }, err1 => {
            if (err1) {
                return reject(err1);
            }

            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: id + 1,
            }, (err2, res) => {
                return err2 ? reject(err2) : resolve(res);
            });
        });
    });
}

/**
 * Beware that due to the need of calling two separate testrpc methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
const increaseTimeTo = (target) => {
    let now = latestTime();
    if (target < now) {
        throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
    }
    let diff = target - now;
    return increaseTime(diff);
};

function latestTime() {
    return web3.eth.getBlock('latest').timestamp;
}


const duration = {
    seconds: function (val) {
        return val;
    },
    minutes: function (val) {
        return val * this.seconds(60);
    },
    hours: function (val) {
        return val * this.minutes(60);
    },
    days: function (val) {
        return val * this.hours(24);
    },
    weeks: function (val) {
        return val * this.days(7);
    },
    years: function (val) {
        return val * this.days(365);
    },
};

module.exports = {
    getDiffInDays,
    latestTime,
    increaseTimeTo,
    increaseTime,
    calculatePercentBonusByDate,
    getDaysInSeconds,
};
