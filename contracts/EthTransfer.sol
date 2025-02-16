// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract EthTransfer {
    event Transfer(
        address indexed from, 
        address indexed to, 
        uint256 value,
        string valueInEth
    );

    error InsufficientAmount();
    error TransferFailed();
    error InvalidAddress();

    // Minimum transfer amount in wei (0.001 ETH)
    uint256 public constant MIN_TRANSFER_AMOUNT = 0.001 ether;

    function transfer(address payable _to) public payable {
        // Check for zero address
        if (_to == address(0)) revert InvalidAddress();
        
        // Check for minimum amount
        if (msg.value < MIN_TRANSFER_AMOUNT) revert InsufficientAmount();
        
        // Convert wei to ETH for logging (divide by 1e18)
        string memory ethAmount = toEthString(msg.value);
        
        console.log(
            "Transferring from %s to %s %s ETH",
            msg.sender,
            _to,
            ethAmount
        );

        // Perform the transfer
        (bool success, ) = _to.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        // Emit event with both wei value and ETH string
        emit Transfer(msg.sender, _to, msg.value, ethAmount);
    }

    // Function to get the balance of an address in wei
    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }

    // Function to get balance in ETH (as a string with 18 decimals)
    function getBalanceInEth(address _address) public view returns (string memory) {
        return toEthString(_address.balance);
    }

    // Helper function to convert wei to ETH string
    function toEthString(uint256 weiAmount) internal pure returns (string memory) {
        // Convert to string with 18 decimal places
        uint256 ethValue = weiAmount / 1e15; // Divide by 1e15 first to handle 3 decimal places
        bool hasDecimals = weiAmount % 1e18 != 0;
        
        if (!hasDecimals) {
            return string(abi.encodePacked(uint2str(weiAmount / 1e18)));
        }

        string memory decimalPart = uint2str(ethValue % 1000);
        while (bytes(decimalPart).length < 3) {
            decimalPart = string(abi.encodePacked("0", decimalPart));
        }

        return string(abi.encodePacked(
            uint2str(weiAmount / 1e18),
            ".",
            decimalPart
        ));
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        
        uint256 temp = _i;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (_i != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_i % 10)));
            _i /= 10;
        }
        
        return string(buffer);
    }

    // Function to get minimum transfer amount in ETH
    function getMinTransferAmount() public pure returns (string memory) {
        return "0.001 ETH";
    }
}