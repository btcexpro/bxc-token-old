pragma solidity ^0.4.24;

import "./BtcexToken.sol";
import "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
import "openzeppelin-solidity/contracts/payment/RefundEscrow.sol";
import "./TokenStrategy.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./TeamTokensVault.sol";


contract BtcexCrowdsale is FinalizableCrowdsale, Pausable {

    RefundEscrow private escrow;
    TokenStrategy tokenStrategy;
    address public teamTokensVault;

    uint tokensUsedOnPresale;
    uint tokensUsedOnSale;

    address teamWallet;
    address advisorWallet;

    constructor(
        TokenStrategy _tokenStrategy,
        BtcexToken _token,
        uint _tokenPrice,
        uint _startPreSale,
        uint _endSale,
        address _ownerWallet,
        address _teamWallet,
        address _advisorWallet
    )
    Crowdsale(_tokenPrice, _ownerWallet, _token)
    TimedCrowdsale(_startPreSale, _endSale)
    public {
        tokenStrategy = TokenStrategy(_tokenStrategy);
        escrow = new RefundEscrow(wallet);
        teamWallet = _teamWallet;
        advisorWallet = _advisorWallet;
    }

    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal whenNotPaused {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        require(_weiAmount >= tokenStrategy.minTransactionAmount());
    }

    function extendCrowdsaleTime() internal {
        closingTime = now + 30 days;
    }

    function finalize() public onlyOwner {
        require(!isFinalized);
        require(hasClosed());
        if (shouldFinalize()) {
            finalization();
            emit Finalized();

            isFinalized = true;
        } else {
            extendCrowdsaleTime();
        }
    }

    function shouldFinalize() private view returns (bool) {
        if (goalReached() || tokenStrategy.goalReachedPercent(weiRaised) < 80) return true;
        return false;
    }

    function finalization() internal {
        if (goalReached()) {
            escrow.close();
            escrow.beneficiaryWithdraw();
            token.transfer(advisorWallet, tokenStrategy.tokensForAdvisors());
            token.transfer(owner, tokenStrategy.tokensForBounty());
            token.transfer(owner, tokenStrategy.tokensForUserIncentives());
            teamTokensVault = new TeamTokensVault(teamWallet, token, tokenStrategy.tokensForTeam() / 4);
            token.transfer(teamTokensVault, tokenStrategy.tokensForTeam());
            // unused tokens goes to owner
            token.transfer(owner, token.balanceOf(address(this)));
        } else {
            escrow.enableRefunds();
        }
    }

    function claimRefund() public {
        require(isFinalized);
        require(!goalReached());

        escrow.withdraw(msg.sender);
    }

    function goalReached() public view returns (bool){
        return tokenStrategy.goalReached(weiRaised);
    }

    function _forwardFunds() internal {
        escrow.deposit.value(msg.value)(msg.sender);
    }

    function isPresaleTime() internal view returns (bool) {
        return block.timestamp < tokenStrategy.startPublicSale();
    }

    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        bool isPresale = isPresaleTime();
        uint tokensAmount = tokenStrategy.getTokenAmount(_weiAmount, isPresale);
        if (isPresale) {
            require(tokensUsedOnPresale.add(tokensAmount) <= tokenStrategy.tokensAvailableForPresale());
            tokensUsedOnPresale = tokensUsedOnPresale.add(tokensAmount);
        } else {
            require(tokensUsedOnSale.add(tokensAmount) <= tokenStrategy.tokensAvailableForSale());
            tokensUsedOnSale = tokensUsedOnSale.add(tokensAmount);
        }
        return tokensAmount;
    }

}
