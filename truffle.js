/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
const HDWalletProvider = require("truffle-hdwallet-provider");
// const mnemonic = "garage salt hammer view capable record reason shed odor fat pistol arrange";
const mnemonic = "magnet two crucial skate slush hip stem wife room day mouse quiz";
const PROVIDER_URL = 'https://rinkeby.infura.io/v3/96db08884141461393f34870bf941192';
module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(mnemonic, PROVIDER_URL);
            },
            network_id: 4,
            gas: 5e6, // 5 million
            gasPrice: 10e9, // 10 gwei
        },
    },
};
