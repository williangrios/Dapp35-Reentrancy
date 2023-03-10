// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract EthFailedBank {
    mapping(address => uint) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external payable {
        (bool sent, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(sent, "failed to send ETH");

        balances[msg.sender] = 0;
    }

    function getBalance(address _addr) external view returns (uint){
        return balances[_addr];
    }

}