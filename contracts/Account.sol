//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.16;

contract Account {
    // struct Individual {
    //     string name;
    //     string qualification;
    //     string designation;
    //     bytes32[] documentList;
    // }
    // struct Institute {
    //     address owner;
    //     string InstituteType;
    //     string[2] geolocation;
    //     mapping(address => string) memberList;
    //     string[] designationList;
    // }
    struct account {
        address owner;
        bytes32 infoHash;
    }
    event UserAdded(address id);
    event InstitudeAdded(address id);
    // mapping(address => bytes32) private _individualAccounts;
    account[] private _individual;
    // mapping(address => bytes32) private _instituteAccounts;
    account[] private _institute;

    function createIndividualAccount(bytes32 hash) public {
        // for (uint256 i = 0; i < 2; i++) {
        //     _individualAccounts[msg.sender][i] = hash[i];
        // }
        // _individualAccounts[msg.sender] = hash;
        _individual.push(account(msg.sender, hash));
    }

    function createInstituteAccount(bytes32 hash) public {
        // for (uint256 i = 0; i < 2; i++) {
        //     _instituteAccounts[msg.sender][i] = hash[i];
        // }
        // _instituteAccounts[msg.sender] = hash;
        _institute.push(account(msg.sender, hash));
    }

    function listIndividualUsers() public view returns (account[] memory) {
        return _individual;
    }

    function listInstituteUsers() public view returns (account[] memory) {
        return _institute;
    }

    function checkId() public view returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[0].owner == msg.sender) {
                return true;
            }
            i++;
        }
        i = 0;
        while (i < _institute.length) {
            if (_institute[0].owner == msg.sender) {
                return true;
            }
            i++;
        }
        return false;
    }
}
