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
    event IndividualAdded(address id);
    event InstituteAdded(address id);
    event IndividualUpdated(address id);
    event InstituteUpdated(address id);
    event roleAdded(address id, string role);
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
        emit IndividualAdded(msg.sender);
    }

    function createInstituteAccount(bytes32 hash) public {
        // for (uint256 i = 0; i < 2; i++) {
        //     _instituteAccounts[msg.sender][i] = hash[i];
        // }
        // _instituteAccounts[msg.sender] = hash;
        _institute.push(account(msg.sender, hash));
        emit InstituteAdded(msg.sender);
    }

    function indivCheckId() public view returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == msg.sender) {
                return true;
            }
            i++;
        }
        return false;
    }

    function institCheckId() public view returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == msg.sender) {
                return true;
            }
            i++;
        }
        return false;
    }

    function indivData() public view returns (bytes32) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == msg.sender) {
                return _individual[i].infoHash;
            }
            i++;
        }
        return 0x0;
    }

    function institData() public view returns (bytes32) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == msg.sender) {
                return _institute[i].infoHash;
            }
            i++;
        }
        return 0x0;
    }

    function updateIndivData(bytes32 hash) public returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == msg.sender) {
                _individual[i].infoHash = hash;
                emit IndividualUpdated(msg.sender);
                return true;
            }
            i++;
        }
        return false;
    }

    function updateInstitData(bytes32 hash) public returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == msg.sender) {
                _institute[i].infoHash = hash;
                emit InstituteUpdated(msg.sender);
                return true;
            }
            i++;
        }
        return false;
    }

    function addRole(bytes32 hash, string memory role) public {
        updateInstitData(hash);
        emit roleAdded(msg.sender, role);
    }
}
