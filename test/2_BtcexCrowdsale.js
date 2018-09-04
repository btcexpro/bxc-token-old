const {
    START_PRESALE_TIME, END_TIME, START_TIME,
} = require('../constants');
const { increaseTimeTo, calculatePercentBonusByDate, getDaysInSeconds } = require('./helpers');
const deployContracts = require('./helpers/deployContracts');
const throwAssert = require('./helpers/throwAssert');
contract('Crowdsale_failure', function ([deployer, account1, account2, account3, account4, teamWallet, advisorWallet]) {
    let instance;
    let tokenInstance;
    let tokenPrice;
    let weiPerCent;

    function weiToUsd(amount) {
        return amount / weiPerCent / 100;
    }

    function getBuyTransactionParams(weiAmount) {
        return {
            from: account1,
            to: instance.address,
            value: weiAmount,
            gas: 3000000,
        };
    }

    function buyTokensFn(timeToIncrease, weiAmount) {
        return async function () {
            const increasedTime = START_PRESALE_TIME + timeToIncrease;
            await increaseTimeTo(increasedTime);
            const tokenBalanceBefore = web3.fromWei(await tokenInstance.balanceOf(account1));
            await instance.buyTokens(account1, getBuyTransactionParams(weiAmount));
            const balance = await tokenInstance.balanceOf(account1);
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

        console.log('================================')
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
    it('should not allow to buy tokens before start pre sale', async () => {
        const weiAmount = web3.toWei('1');
        await throwAssert(() => instance.buyTokens(account1, getBuyTransactionParams(weiAmount)));
    });
    it('should buy tokens on presale with 30% bonus', buyTokensFn(1, web3.toWei('50')));
    it('should not allow to buy tokens for presale less then 10000$', async () => {
        await throwAssert(() => instance.buyTokens(account1, getBuyTransactionParams(web3.toWei('10'))));
    });
    it('should not allow to buy tokens for presale less then 100000$', async () => {
        await throwAssert(() => instance.buyTokens(account1, getBuyTransactionParams(web3.toWei('500'))));
    });
    it('should buy tokens from buy tokens method with 20 percent bonus', buyTokensFn(getDaysInSeconds(15 + 1), web3.toWei('1')));
    it('should buy tokens by send ether to directly to crowdsale address with 15 percent bonus', buyTokensFn(getDaysInSeconds(18 + 1), web3.toWei('1')));
    it('should buy tokens with 10 percent bonus', buyTokensFn(getDaysInSeconds(21 + 1), web3.toWei('1')));
    it('should buy tokens with 5 percent bonus', buyTokensFn(getDaysInSeconds(24 + 1), web3.toWei('1')));
    it('should buy tokens with 2.5 percent bonus', buyTokensFn(getDaysInSeconds(27 + 1), web3.toWei('1')));
    it('should buy tokens with 0 percent bonus', buyTokensFn(getDaysInSeconds(30 + 1), web3.toWei('1')));
    it('should not allow to send less then min transaction', async () => {
        const weiAmount = web3.toWei('0.01');
        await throwAssert(() => web3.eth.sendTransaction(getBuyTransactionParams(weiAmount)));
    });
    it('should not be finalized until the end time', async () => {
        const isFinalized = await instance.isFinalized();
        assert.isFalse(isFinalized, 'isFinalized incorrect');
    });
    it('should not allow to finalize before closing time', async () => {
        await throwAssert(() => instance.finalize({ from: deployer }));
    });
    it('should not allow to buy tokens after closing time', async () => {
        const weiAmount = web3.toWei('1');
        await increaseTimeTo(END_TIME + 1);
        await throwAssert(() => instance.buyTokens(account1, getBuyTransactionParams(weiAmount)));
    });
    it('should allow to finalize only owner', async () => {
        await throwAssert(() => instance.finalize({ from: account1 }));
    });
    it('should allow owner to finalize after closing time', async () => {
        const isFinalizedBefore = await instance.isFinalized();
        assert.isFalse(isFinalizedBefore);
        const tx = await instance.finalize({ from: deployer });
        const isFinalizedAfter = await instance.isFinalized();
        assert.isTrue(isFinalizedAfter, 'Was not finalized');
    });
    it('should allow refund for contributor', async () => {
        const balanceBefore = await web3.eth.getBalance(account1);
        await instance.claimRefund({ from: account1 });
        const balanceAfter = await web3.eth.getBalance(account1);
        assert.isAbove(balanceAfter.toNumber(), balanceBefore.toNumber(), 'Balance after less then before');
    });
});
