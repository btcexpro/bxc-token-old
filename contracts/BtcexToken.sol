pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";


contract BtcexToken is CappedToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    constructor(string _name, string _symbol, uint8 _decimals, uint _cap)
    CappedToken(_cap)
    public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
}
