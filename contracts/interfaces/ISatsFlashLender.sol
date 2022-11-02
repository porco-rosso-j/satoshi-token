pragma solidity ^0.6.11;

import "./ISatsFlashBorrower.sol";

interface ISatsFlashLender {

    function flashMintSATS(
        ISatsFlashBorrower receiver,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);
}

//https://github.com/makerdao/dss-flash/blob/master/src/interface/IVatDaiFlashLender.sol