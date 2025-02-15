// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract EthTransfer {
    event Transfer(address indexed from, address indexed to, uint256 value);

    function transfer(address payable _to) public payable {
        require(msg.value > 0, "Must send some ETH");
        
        console.log(
            "Transferring from %s to %s %s wei",
            msg.sender,
            _to,
            msg.value
        );

        _to.transfer(msg.value);
        emit Transfer(msg.sender, _to, msg.value);
    }

    // Function to get the balance of an address
    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }
}

