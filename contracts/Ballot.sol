// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    struct Pemilih {
        uint weight;
        bool voted;
        uint vote;
    }

    struct Proposal {
        string name;
        uint voteCount;
    }

    address public ketuaPemilu;
    mapping(address => Pemilih) public voters;
    Proposal[] public proposals;

    constructor(string[] memory namaProposal) {
        ketuaPemilu = msg.sender;
        voters[ketuaPemilu].weight = 1;
        for (uint i = 0; i < namaProposal.length; i++) {
            proposals.push(Proposal({ name: namaProposal[i], voteCount: 0 }));
        }
    }

    function giveRightToVote(address voter) external {
        require(msg.sender == ketuaPemilu, "Only chairperson");
        require(!voters[voter].voted, "Already voted");
        require(voters[voter].weight == 0, "Already has right");
        voters[voter].weight = 1;
    }

    function vote(uint proposal) external {
        Pemilih storage sender = voters[msg.sender];
        require(sender.weight != 0, "No right to vote");
        require(!sender.voted, "Already voted");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (string memory winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
