const deployContracts = require('./helpers/deployContracts');

const {
    START_PRESALE_TIME, END_TIME, START_TIME
} = require('../constants');
const { increaseTimeTo, calculatePercentBonusByDate, getDaysInSeconds } = require('./helpers');
const throwAssert = require('./helpers/throwAssert');
contract('Crowdsale_success', function ([deployer, account1, account2, account3, account4, teamWallet, advisorWallet]) {
    let instance;
    let tokenInstance;
    let tokenPrice;
    let weiPerCent;

    function weiToUsd(amount) {
        return amount / weiPerCent / 100;
    }

    function getBuyTransactionParams(weiAmount, account) {
        return {
            from: account,
            to: instance.address,
            value: weiAmount,
            gas: 3000000,
        };
    }

    function buyTokensFn(timeToIncrease, weiAmount, account) {
        return async function () {
            const increasedTime = START_PRESALE_TIME + timeToIncrease;
            await increaseTimeTo(increasedTime);
            const tokenBalanceBefore = web3.fromWei(await tokenInstance.balanceOf(account));
            await instance.buyTokens(account, getBuyTransactionParams(weiAmount, account));
            const balance = await tokenInstance.balanceOf(account);
            const tokenBalance = (web3.fromWei(balance)).toNumber();
            const tokenAmountByRate = (web3.toWei(web3.toBigNumber(parseInt(weiAmount / tokenPrice), 10))).toNumber();
            const tokenBonus = (web3.toBigNumber(tokenAmountByRate * calculatePercentBonusByDate(increasedTime, START_TIME, weiToUsd(weiAmount)) / 1000)).toNumber();
            const expectedBalanceWithBonus = web3.toBigNumber(tokenAmountByRate + tokenBonus);
            assert.equal(Math.round(tokenBalance * 100) / 100, Math.round((tokenBalanceBefore.toNumber() + (web3.fromWei(expectedBalanceWithBonus)).toNumber()) * 100) / 100, 'Incorrect balance after buy tokens');
        };
    }

    before(async () => {
        const deployedContracts = await deployContracts(deployer, teamWallet, advisorWallet);
        weiPerCent = deployedContracts.weiPerCent;
        tokenPrice = deployedContracts.tokenPrice;
        tokenInstance = deployedContracts.tokenInstance;
        instance = deployedContracts.instance;
    });


    it('should create Crowdsale contract with correct parameters', async () => {
        const startPreSale = await instance.openingTime();
        const endSale = await instance.closingTime();
        assert.equal(startPreSale.toNumber(), START_PRESALE_TIME, 'start presale incorrect');
        assert.equal(endSale.toNumber(), END_TIME, 'end sale incorrect');
    });
    it('should transfer ownership of token to Crowdsale contract', async () => {
        await tokenInstance.transferOwnershipAndTotalBalance(instance.address, { from: deployer });
        const newOwner = await tokenInstance.owner();
        assert.equal(newOwner, instance.address, 'Invalid owner');
    });
    it('should have 0 balance before buy tokens', async () => {
        const balance = web3.fromWei(await tokenInstance.balanceOf(account1));
        assert.equal(balance, 0, 'Balance before buy is not zero');
    });
    it('should not be at "goalReached" state before enough tokens was not bought', async () => {
        const goalReached = await instance.goalReached();
        assert.isFalse(goalReached);
    });
    it('should buy tokens for account1', buyTokensFn(getDaysInSeconds(30 + 1), parseInt(web3.toWei('900')), account1));
    it('should buy tokens for account2', buyTokensFn(getDaysInSeconds(30 + 1), parseInt(web3.toWei('900')), account2));
    it('should buy tokens for account3', buyTokensFn(getDaysInSeconds(30 + 1), parseInt(web3.toWei('900')), account3));
    it('should buy tokens for account4', buyTokensFn(getDaysInSeconds(30 + 1), parseInt(web3.toWei('900')), account4));
    it('should not be finalized until the end time', async () => {
        const isFinalized = await instance.isFinalized();
        assert.isFalse(isFinalized, 'isFinalized incorrect');
    });
    it('should not allow to finalize before closing time', async () => {
        await throwAssert(() => instance.finalize({ from: deployer }));
    });
    it('should allow to finalize only owner', async () => {
        await throwAssert(() => instance.finalize({ from: account1 }));
    });
    it('should allow owner to finalize after closing time', async () => {
        const isFinalizedBefore = await instance.isFinalized();
        assert.isFalse(isFinalizedBefore);
        await increaseTimeTo(END_TIME + 1);
        await instance.finalize({ from: deployer });
        const isFinalizedAfter = await instance.isFinalized();
        assert.isTrue(isFinalizedAfter, 'Was not finalized');
    });
    it('should create TeamTokensVault after finalize', async () => {
        const teamWallet = await instance.teamTokensVault();
        assert.isTrue(web3.isAddress(teamWallet));
    });
    it('should not allow claim tokens for team after creation', async () => {
        await throwAssert(() => instance.claimRefund({ from: deployer }));
    });
    it('should be at "goalReached" state', async () => {
        const goalReached = await instance.goalReached();
        assert.isTrue(goalReached);
    });
    it('should not allow allow refund for contributor', async () => {
        await throwAssert(() => instance.claimRefund({ from: account1 }));
    });

});
