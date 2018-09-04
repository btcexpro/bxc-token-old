pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract BtcexToken is StandardToken, Ownable {
    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(string _name, string _symbol, uint8 _decimals, uint _totalTokens)
    public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply_ = _totalTokens;
    }

    function transferOwnershipAndTotalBalance(address _crowdsale) onlyOwner public {
        balances[_crowdsale] = totalSupply_;
        transferOwnership(_crowdsale);

    }
}
