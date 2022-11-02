pragma solidity ^0.6.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ISATOSHI.sol";
import "hardhat/console.sol";

contract FlashTest {

    address public borrowProxy;
    address payable public satoshi;

    constructor(address _borrowProxy, address payable _satoshi) public {
        borrowProxy = _borrowProxy;
        satoshi = _satoshi;
    }

    modifier onlyBorrowProxy {
        if (msg.sender == borrowProxy) {
            _;
        }
    }

    function normalFlashloan(
        uint256 _amountToBorrow, 
        uint256 _amountPayback
        ) external { 

        ISATOSHI(satoshi).flashBTC( //
            _amountToBorrow,
            abi.encodeWithSelector(
                this.flashCallback.selector,
                _amountPayback,
                msg.sender
            )
        );
    }

    function flashCallback(
        uint256 _amountPayback,
        address _user
    ) external onlyBorrowProxy {
        console.log("_amountPayback", _amountPayback);
        uint balance = address(this).balance;
        console.log("balance", balance);//

        (bool success, ) = satoshi.call{ value: _amountPayback }("");
        // Payback means Reentrancy in this context. How can I fix this? interestinG!

        require(success, "Flashtest: Failed to payback");
        uint profit = address(this).balance;
        console.log("profit", profit);
        
        if (profit > 0) {
          (success, ) = _user.call{ value: profit }("");
        }

    }


    // Reentrancy Attack FlashLoan
    function reentFalshloan(uint256 _amountToBorrow, uint256 _amountPayback) external {
        ISATOSHI(satoshi).flashBTC(_amountToBorrow,
            abi.encodeWithSelector(
                this.falshCallback_Reent.selector,
                _amountPayback,
                msg.sender
            )
        );
    }

    function falshCallback_Reent(
        uint256 _amountPayback,
        uint attack_type,
        address _user
    ) external onlyBorrowProxy {

        //if (attack_type == 0) {
        // Reent via flashBTC
        ISATOSHI(satoshi).flashBTC(_amountPayback, 
        abi.encodeWithSelector(
            this.flashCallback.selector, 
            _amountPayback,
            msg.sender
            )
        );
        //} else if (attack_type == 1) {
        // Reent via deposit
        uint balance = address(this).balance;
        ISATOSHI(satoshi).depositRBTC{value:_amountPayback}();
        //} else if (attack_type == 2) {
        // Some attack here....

        //} else {
          return;
        //}
    }
    

    receive() external payable{}
}