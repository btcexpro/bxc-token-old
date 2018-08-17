const BtcexToken = artifacts.require("./BtcexToken.sol");
const { TOKEN_CAP } = require('../constants');

contract('Token', function () {
    let instance;
    it('should create token with correct cap', async () => {
        instance = await BtcexToken.deployed();
        const cap = await instance.cap();
        assert.equal(cap.toNumber(), TOKEN_CAP, 'Token cap invalid');
    });
});