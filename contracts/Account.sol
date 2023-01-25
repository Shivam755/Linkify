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
    event roleAdded(address id, string[] role);
    // mapping(address => bytes32) private _individualAccounts;
    account[] private _individual;
    // mapping(address => bytes32) private _instituteAccounts;
    account[] private _institute;

    function createIndividualAccount(address id, bytes32 hash) public {
        _individual.push(account(id, hash));
        emit IndividualAdded(id);
    }

    function createInstituteAccount(address id, bytes32 hash) public {
        _institute.push(account(id, hash));
        emit InstituteAdded(id);
    }

    function indivCheckId(address id) public view returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == id) {
                return true;
            }
            i++;
        }
        return false;
    }

    function institCheckId(address id) public view returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == id) {
                return true;
            }
            i++;
        }
        return false;
    }

    function indivData(address id) public view returns (bytes32) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == id) {
                return _individual[i].infoHash;
            }
            i++;
        }
        return 0x0;
    }

    function institData(address id) public view returns (bytes32) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == id) {
                return _institute[i].infoHash;
            }
            i++;
        }
        return 0x0;
    }

    function updateIndivData(address id, bytes32 hash) public returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == id) {
                _individual[i].infoHash = hash;
                emit IndividualUpdated(id);
                return true;
            }
            i++;
        }
        return false;
    }

    function updateInstitData(address id, bytes32 hash) public returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == id) {
                _institute[i].infoHash = hash;
                emit InstituteUpdated(id);
                return true;
            }
            i++;
        }
        return false;
    }

    function deleteIndivData(address id) public returns (bool) {
        uint256 i = 0;
        while (i < _individual.length) {
            if (_individual[i].owner == id) {
                _individual[i] = _individual[_individual.length - 1];
                _individual.pop();
                emit IndividualDeleted(id);
                return true;
            }
            i++;
        }
        return false;
    }

    function deleteInstitData(address id) public returns (bool) {
        uint256 i = 0;
        while (i < _institute.length) {
            if (_institute[i].owner == id) {
                _institute[i] = _institute[_institute.length - 1];
                _institute.pop();
                return true;
            }
            i++;
        }
        return false;
    }

    function individualChangePassword(address id, bytes32 hash) public {
        updateIndivData(id, hash);
        emit passwordChanged(id);
    }

    function instituteChangePassword(address id, bytes32 hash) public {
        updateInstitData(id, hash);
        emit passwordChanged(id);
    }

    function addRole(
        address id,
        bytes32 hash,
        string[] memory role
    ) public {
        updateInstitData(id, hash);
        emit roleAdded(id, role);
    }
}
