// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "./ISatsFlashLender.sol";

interface ISATOSHI is IERC20, ISatsFlashLender {

    function getRBTCBalance() external view returns(uint);
    function getSATSandRBTCratio() external view returns(uint);
    function getCeiling() external view returns(uint);

    function depositRBTC() external payable;
    function depositRBTCto(address _user) external payable;
    function withdrawRBTC(uint sats_amt) external;
    function withdrawRBTCto(uint sats_amt, address _user) external;
    function flashBTC(uint _amount, bytes calldata _data) external payable;

}