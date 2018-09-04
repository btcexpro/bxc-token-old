const {
    START_PRESALE_TIME, END_TIME,
} = require('../constants');
const deployContracts = require('./helpers/deployContracts');
contract('Crowdsale_oraclize', function ([deployer, account1, account2, account3, account4, teamWallet, advisorWallet]) {
    let instance;
    let tokenInstance;
    let tokenStrategy;
    let tokenPrice;
    let weiPerCent;

    before(async () => {
        const deployedContracts = await deployContracts(deployer, teamWallet, advisorWallet, (web3.toWei('1') / (parseFloat("268.99000000") * 100)));
        weiPerCent = deployedContracts.weiPerCent;
        tokenPrice = deployedContracts.tokenPrice;
        tokenInstance = deployedContracts.tokenInstance;
        instance = deployedContracts.instance;
        tokenStrategy = deployedContracts.tokenStrategy;
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
    it('should fund TokenStrategyBalance with 1 eth', async () => {
        const balance = await web3.eth.getBalance(tokenStrategy.address);
        assert.equal(balance.toNumber(), parseInt(web3.toWei('1')));
    });
    it('should update price', async () => {
        const rateBefore = web3.fromWei(await tokenStrategy.rate());
        const weiPerCentBefore = await tokenStrategy.weiPerCent();
        await tokenStrategy.updatePrice();
        return new Promise(resolve => {
            setTimeout(async () => {
                const rateAfter = web3.fromWei(await tokenStrategy.rate());
                const weiPerCentAfter = await tokenStrategy.weiPerCent();
                assert.notEqual(rateBefore.toNumber(), rateAfter.toNumber());
                assert.notEqual(weiPerCentBefore.toNumber(), weiPerCentAfter.toNumber());
                resolve();
            }, 35000);
        });
    });
});
