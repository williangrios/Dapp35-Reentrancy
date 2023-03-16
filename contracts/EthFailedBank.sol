// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

contract EthFailedBank {
    mapping(address => uint) public balances;

    function deposit() external payable {
        require(msg.value == 100);
        balances[msg.sender] += 100;
    }

    function withdraw(uint amount) external payable {
        require(balances[msg.sender] >= amount);
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "failed to send ETH");
        balances[msg.sender] -= amount;
    }

    function getUserBalance(address _addr) external view returns (uint) {
        return balances[_addr];
    }
}
