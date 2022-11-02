pragma solidity ^0.6.11;

import "../interfaces/ISATOSHI.sol";
import "../interfaces/ISatsFlashBorrower.sol";
import "hardhat/console.sol";

contract FlashMintTest is ISatsFlashBorrower {
    enum Action {NORMAL, STEAL, WITHDRAW, REENTER}

    uint256 public flashBalance;
    uint256 public flashValue;
    address public flashSender;
    address public satoshi;

    constructor(address _satoshi) public {
        satoshi = _satoshi;
    }

    function onSatsFlashLoan(address sender, uint256 value, bytes calldata data) external override returns(bytes32) {
        //address sender = msg.sender;
        (Action action) = abi.decode(data, (Action)); // Use this to unpack arbitrary data

        flashSender = sender;
        flashValue = value;

        if (action == Action.NORMAL) {
            flashBalance = ISATOSHI(satoshi).balanceOf(address(this));
        } else if (action == Action.WITHDRAW) {
            ISATOSHI(satoshi).withdrawRBTC(value);
            flashBalance = address(this).balance;
            ISATOSHI(satoshi).depositRBTC{ value: value }();
        } else if (action == Action.STEAL) {
            // Do nothing
            ISATOSHI(satoshi).transfer(0x90F79bf6EB2c4f870365E785982E1f101E93b906, ISATOSHI(satoshi).balanceOf(address(this)));
        } else if (action == Action.REENTER) {
            bytes memory newData = abi.encode(Action.NORMAL);
            ISATOSHI(satoshi).approve(satoshi, ISATOSHI(satoshi).allowance(address(this), satoshi) + value * 2);
            ISATOSHI(satoshi).flashMintSATS(this, value * 2, newData);
        }

        return keccak256("ISatsFlashBorrower.onSatsFlashLoan");
    }

    function flashMint(uint256 value) public {
        // Use this to pack arbitrary data to `onFlashLoan`
        bytes memory data = abi.encode(Action.NORMAL);
        ISATOSHI(satoshi).approve(satoshi, value);
        ISATOSHI(satoshi).flashMintSATS(this, value, data);
    }

    function flashMintAndWithdraw(uint256 value) public {
        // Use this to pack arbitrary data to `onFlashLoan`
        bytes memory data = abi.encode(Action.WITHDRAW);
        ISATOSHI(satoshi).approve(satoshi, value);
        ISATOSHI(satoshi).flashMintSATS(this, value, data);
    }

    function flashMintAndSteal(uint256 value) public {
        // Use this to pack arbitrary data to `onFlashLoan`
        bytes memory data = abi.encode(Action.STEAL);
        ISATOSHI(satoshi).flashMintSATS(this, value, data);
    }

    function flashMintAndReenter(uint256 value) public {
        // Use this to pack arbitrary data to `onFlashLoan`
        bytes memory data = abi.encode(Action.REENTER);
        ISATOSHI(satoshi).approve(satoshi, value);
        ISATOSHI(satoshi).flashMintSATS(this, value, data);
    }

    receive() external payable {}
}