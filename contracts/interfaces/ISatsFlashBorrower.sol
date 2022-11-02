// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

interface ISatsFlashBorrower {

    function onSatsFlashLoan(
        address initiator,
        uint256 amount,
        bytes calldata data
    ) external returns (bytes32);
}

//https://github.com/makerdao/dss-flash/blob/master/src/interface/IVatDaiFlashBorrower.sol