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

    event UserAdded(address id);
    event InstitudeAdded(address id);
    mapping(address => bytes32) private _individualAccounts;
    mapping(address => bytes32[2]) private _instituteAccounts;

    function createIndividualAccount(bytes32 hash) public {
        // for (uint256 i = 0; i < 2; i++) {
        //     _individualAccounts[msg.sender][i] = hash[i];
        // }
        _individualAccounts[msg.sender] = hash;
    }

    function createInstituteAccount(bytes32[2] memory hash) public {
        for (uint256 i = 0; i < 2; i++) {
            _instituteAccounts[msg.sender][i] = hash[i];
        }
    }
}
