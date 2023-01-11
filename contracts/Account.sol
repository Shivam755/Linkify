//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.16;

contract Account {
    struct account {
        address owner;
        bytes32 infoHash;
    }
    event IndividualAdded(address id);
    event InstituteAdded(address id);
    event IndividualUpdated(address id);
    event InstituteUpdated(address id);
    event IndividualDeleted(address id);
    event InstituteDeleted(address id);
    event passwordChanged(address id);
    event roleAdded(address id, string role);
    // mapping(address => bytes32) private _individualAccounts;
    account[] private _individual;
    // mapping(address => bytes32) private _instituteAccounts;
    account[] private _institute;

    function createIndividualAccount(bytes32 hash) public {
        _individual.push(account(msg.sender, hash));
        emit IndividualAdded(msg.sender);
    }

    function createInstituteAccount(bytes32 hash) public {
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

    function deleteIndivData() public returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == msg.sender) {
                _individual[i] = _individual[_individual.length - 1];
                _individual.pop();
                emit IndividualDeleted(msg.sender);
                return true;
            }
            i++;
        }
        return false;
    }

    function deleteInstitData() public returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == msg.sender) {
                _institute[i] = _institute[_institute.length - 1];
                _institute.pop();
                return true;
            }
            i++;
        }
        return false;
    }

    function individualChangePassword(bytes32 hash) public {
        updateIndivData(hash);
        emit passwordChanged(msg.sender);
    }

    function instituteChangePassword(bytes32 hash) public {
        updateInstitData(hash);
        emit passwordChanged(msg.sender);
    }

    function addRole(bytes32 hash, string memory role) public {
        updateInstitData(hash);
        emit roleAdded(msg.sender, role);
    }
}
