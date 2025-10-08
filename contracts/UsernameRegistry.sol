// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UsernameRegistry {
    mapping(address => string) public addressToUsername;
    mapping(string => address) public usernameToAddress;
    mapping(string => bool) public usernameTaken;
    
    uint256 public constant REGISTRATION_FEE = 0.001 ether;
    uint256 public constant UPDATE_FEE = 0.005 ether;
    
    event UsernameRegistered(address indexed user, string username);
    event UsernameUpdated(address indexed user, string oldUsername, string newUsername);
    
    function registerUsername(string memory username) public payable {
        require(msg.value >= REGISTRATION_FEE, "Insufficient fee");
        require(bytes(addressToUsername[msg.sender]).length == 0, "Already registered");
        require(!usernameTaken[username], "Username taken");
        require(bytes(username).length >= 3 && bytes(username).length <= 20, "Invalid length");
        require(isValidUsername(username), "Invalid characters");
        
        addressToUsername[msg.sender] = username;
        usernameToAddress[username] = msg.sender;
        usernameTaken[username] = true;
        
        emit UsernameRegistered(msg.sender, username);
    }
    
    function updateUsername(string memory newUsername) public payable {
        require(msg.value >= UPDATE_FEE, "Insufficient fee");
        require(bytes(addressToUsername[msg.sender]).length > 0, "Not registered");
        require(!usernameTaken[newUsername], "Username taken");
        require(bytes(newUsername).length >= 3 && bytes(newUsername).length <= 20, "Invalid length");
        require(isValidUsername(newUsername), "Invalid characters");
        
        string memory oldUsername = addressToUsername[msg.sender];
        
        delete usernameToAddress[oldUsername];
        delete usernameTaken[oldUsername];
        
        addressToUsername[msg.sender] = newUsername;
        usernameToAddress[newUsername] = msg.sender;
        usernameTaken[newUsername] = true;
        
        emit UsernameUpdated(msg.sender, oldUsername, newUsername);
    }
    
    function getUsername(address user) public view returns (string memory) {
        return addressToUsername[user];
    }
    
    function getAddress(string memory username) public view returns (address) {
        return usernameToAddress[username];
    }
    
    function isValidUsername(string memory username) internal pure returns (bool) {
        bytes memory b = bytes(username);
        for(uint i = 0; i < b.length; i++){
            bytes1 char = b[i];
            if(!(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char == 0x5F)                    // _
            )) {
                return false;
            }
        }
        return true;
    }
}
