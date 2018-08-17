pragma solidity ^0.4.24;

import "./BtcexToken.sol";
import "openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";

contract BtcexCrowdsale is RefundableCrowdsale {
    uint public minTransactionAmount;

    constructor(
        BtcexToken _token,
        uint _tokenPrice,
        uint _startPreSale,
        uint _endSale,
        uint _hardCap,
        uint _softCap,
        address _ownerWallet,
        uint _minTransactionAmount
    )
    Crowdsale(_tokenPrice, _ownerWallet, _token)
    TimedCrowdsale(_startPreSale, _endSale)
    RefundableCrowdsale(_softCap)
    public {
        minTransactionAmount = _minTransactionAmount;
    }

    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) onlyWhileOpen internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        require(_weiAmount >= minTransactionAmount, "Min transaction error");
    }

    function _getBonus() private view returns (uint) {
        if (block.timestamp > openingTime + 15 days) {
            return 0;
        } else if (block.timestamp > openingTime + 12 days) {
            return 25;
        } else if (block.timestamp > openingTime + 9 days) {
            return 50;
        } else if (block.timestamp > openingTime + 6 days) {
            return 100;
        } else if (block.timestamp > openingTime + 3 days) {
            return 150;
        } else {
            return 200;
        }
    }

    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint bonusPercent = _getBonus();
        uint tokenAmount = _weiAmount.mul(rate);
        if (bonusPercent == 0) {
            return tokenAmount;
        }
        uint bonus = tokenAmount * bonusPercent / 1000;
        return tokenAmount + bonus;
    }

    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        require(BtcexToken(address(token)).mint(_beneficiary, _tokenAmount));
    }
}
