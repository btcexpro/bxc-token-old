pragma solidity ^0.4.24;

import "./oraclizeAPI_0.5.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract TokenStrategy is usingOraclize {
    using SafeMath for uint256;

    uint public minTransactionAmount = 100000000000000000;
    uint public tokensAvailableForPresale = 15000000 * 10 ** 18;
    uint public tokensAvailableForSale = 15000000 * 10 ** 18;
    uint public tokensForUserIncentives = 13000000 * 10 ** 18;
    uint public tokensForTeam = 6000000 * 10 ** 18;
    uint public tokensForAdvisors = 1000000 * 10 ** 18;
    uint public tokensForBounty = 1000000 * 10 ** 18;

    uint public startPublicSale;

    uint public rate;
    uint public weiPerCent;
    uint256 public goal;
    uint256 public goalUSD;


    address owner;
    uint balance;

    uint internal bonusPeriod0;
    uint internal bonusPeriod25;
    uint internal bonusPeriod50;
    uint internal bonusPeriod100;
    uint internal bonusPeriod150;
    uint internal bonusPeriod200;

    event LogNewOraclizeQuery(string _message);

    constructor(
        uint _startPublicSale,
        uint _weiPerCent,
        uint _rate,
        uint _goal,
        uint _goalUSD
    ) public{
        require(_goal > 0);
        startPublicSale = _startPublicSale;
        weiPerCent = _weiPerCent;
        rate = _rate;
        goal = _goal;
        goalUSD = _goalUSD;
        owner = msg.sender;
        bonusPeriod0 = startPublicSale.add(15 days);
        bonusPeriod25 = startPublicSale.add(12 days);
        bonusPeriod50 = startPublicSale.add(9 days);
        bonusPeriod100 = startPublicSale.add(6 days);
        bonusPeriod150 = startPublicSale.add(3 days);
//        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        oraclize_setCustomGasPrice(2000000000);
    }

    function getPublicSaleBonus() internal view returns (uint) {
        if (block.timestamp > bonusPeriod0) {
            return 0;
        } else if (block.timestamp > bonusPeriod25) {
            return 25;
        } else if (block.timestamp > bonusPeriod50) {
            return 50;
        } else if (block.timestamp > bonusPeriod100) {
            return 100;
        } else if (block.timestamp > bonusPeriod150) {
            return 150;
        } else {
            return 200;
        }
    }

    function getPresaleBonus(uint _weiAmount) internal view returns (uint){
        uint usdAmount = weiToUsd(_weiAmount);
        require(usdAmount >= 10000 && usdAmount <= 100000);
        if (usdAmount >= 10000 && usdAmount <= 25000) {
            return 300;
        } else if (usdAmount > 25000 && usdAmount <= 50000) {
            return 350;
        } else if (usdAmount > 50000) {
            return 400;
        }
    }

    function weiToUsd(uint _amount) internal view returns (uint) {
        return _amount / weiPerCent / 100;
    }

    function __callback(bytes32 myid, string result) public {
        if (msg.sender != oraclize_cbAddress()) revert();
        weiPerCent = 1 ether / stringToUint(result, 2);
        goal = weiPerCent * 100 * goalUSD;
        rate = weiPerCent * 25;
        updatePrice();
    }

    function updatePrice() public payable {
        require(msg.sender == owner || msg.sender == oraclize_cbAddress());
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query(360, "URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price", 100000);
//            oraclize_query("URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price", 100000);
        }
    }

    function stringToUint(string _amount, uint _maxCounterAfterDot) internal constant returns (uint result) {
        bytes memory b = bytes(_amount);
        uint i;
        uint counterBeforeDot;
        uint counterAfterDot;
        result = 0;
        uint totNum = b.length;
        totNum--;
        bool hasDot = false;

        for (i = 0; i < b.length; i++) {
            uint c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
                counterBeforeDot ++;
                totNum--;
            }
            if (c == 46) {
                hasDot = true;
                break;
            }
        }

        if (hasDot) {
            for (uint j = counterBeforeDot + 1; j < counterBeforeDot + 1 + _maxCounterAfterDot; j++) {
                uint m = uint(b[j]);

                if (m >= 48 && m <= 57) {
                    result = result * 10 + (m - 48);
                    counterAfterDot ++;
                    totNum--;
                }

                if (totNum == 0) {
                    break;
                }
            }
        }
        return result;
    }

    function getTokenAmount(uint _weiAmount, bool _isPresale) external returns (uint) {
        uint tokenAmount = _weiAmount.div(rate) * 1 ether;
        uint bonusPercent;
        if (_isPresale) {
            bonusPercent = getPresaleBonus(_weiAmount);
        } else {
            bonusPercent = getPublicSaleBonus();
        }
        if (bonusPercent == 0) {
            return tokenAmount;
        }
        return tokenAmount.add(tokenAmount.mul(bonusPercent).div(1000));
    }

    function goalReachedPercent(uint _weiRaised) view public returns (uint) {
        return _weiRaised.mul(100).div(goal);
    }
    function goalReached(uint _weiRaised) public view returns (bool) {
        return _weiRaised >= goal;
    }

    function() public payable {
        balance = balance.add(msg.value);
    }
}
