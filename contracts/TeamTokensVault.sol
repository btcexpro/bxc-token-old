pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract TeamTokensVault {
    address internal teamWallet;
    ERC20 internal token;
    uint internal tokensPerYear;
    uint internal timeAvailableForClaim;

    constructor(address _teamWallet, ERC20 _token, uint _tokensCountPerYear) public{
        teamWallet = _teamWallet;
        token = ERC20(_token);
        tokensPerYear = _tokensCountPerYear;
        updateTime();
    }

    function claimTokensForTeamWallet() public {
        require(token.balanceOf(address(this)) >= tokensPerYear);
        require(isAvailableForClaim());
        token.transfer(teamWallet, tokensPerYear);
    }

    function updateTime() internal {
        timeAvailableForClaim = block.timestamp + 365 days;
    }

    function isAvailableForClaim() public view returns (bool) {
        return block.timestamp >= timeAvailableForClaim;
    }
}
