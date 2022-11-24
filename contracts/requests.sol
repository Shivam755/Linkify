//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.16;
import "./Account.sol";

contract RequestHandler is Account {
    enum Decision {
        Pending,
        Accepted,
        Rejected
    }
    enum requestType {
        InstituteJoining,
        Recruitment
    }
    struct Request {
        uint256 id;
        address requester;
        address approver;
        requestType _type;
        string message;
        Decision status;
    }
    Request[] private _requests;

    function addRequest(
        address _approver,
        string memory _message,
        requestType _type
    ) public {
        _requests.push(
            Request(
                _requests.length,
                msg.sender,
                _approver,
                _type,
                _message,
                Decision.Pending
            )
        );
    }

    function updateRequest(uint256 id, Decision decision)
        public
        returns (bool)
    {
        for (uint256 i = 0; i < _requests.length; i++) {
            if (_requests[i].id == id) {
                _requests[i].status = decision;
                return true;
            }
        }
        return false;
    }
}
