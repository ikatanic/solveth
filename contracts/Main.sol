pragma solidity ^0.4.8;

contract ProblemContract {
    function check(uint[] input, uint[] output) returns (bool);
}

contract Main {
    struct Problem {
        address contractAddress;
        string description;
    }

    enum InstanceState {Unsolved, Commited, Solved}

    struct Instance {
        address contractAddress;
        uint[] input;
        uint reward;
        InstanceState state;

        bytes32 commitmentHash;
        address commitedSolver;

        uint[] solution;
    }

    Problem[] problems;
    Instance[] instances;

    uint[] emptyArray;

    function newProblem(address contractAddress, string description) {
       problems.push(Problem({
           contractAddress: contractAddress,
           description: description
       }));
    }

    function newInstance(address contractAddress, uint[] input) payable returns (uint) {
        if (msg.value > 0) {
            uint instanceId = instances.length;
            instances.push(Instance({
                contractAddress: contractAddress,
                input: input,
                reward: msg.value,
                state: InstanceState.Unsolved,
                commitmentHash: 0x0,
                commitedSolver: 0x0,
                solution: emptyArray
            }));
            return instanceId;
        } else {
            throw;
        }
    }

    function commitSolution(uint instanceId, bytes32 commitmentHash) {
        if (instanceId >= instances.length) {
            throw;
        }
        Instance instance = instances[instanceId]; // reference to instance
        if (instance.state != InstanceState.Unsolved) {
            throw;
        }

        instance.state = InstanceState.Commited;
        instance.commitmentHash = commitmentHash;
        instance.commitedSolver = msg.sender;
    }

    function revealSolution(uint instanceId, uint[] output) {
        if (instanceId >= instances.length) {
            throw;
        }
        Instance instance = instances[instanceId]; // reference to the instance
        if (instance.state != InstanceState.Commited || instance.commitedSolver != msg.sender) {
            throw;
        }

        // verify commitmentHash
        bytes32 commitmentHash = computeCommitmentHash(msg.sender, output);
        if (commitmentHash != instance.commitmentHash) {
            throw;
        }

        if (!ProblemContract(instance.contractAddress).check(instance.input, output)) {
            throw;
        }

        // task solved! send reward
        instance.state = InstanceState.Solved;
        instance.solution = output;
        if (!msg.sender.send(instance.reward)) {
            throw;
        }
    }

    function computeCommitmentHash(address solver, uint[] output) returns (bytes32) {
        bytes32 result = sha3(solver);
        for (uint i = 0; i < output.length; ++i) {
            result = result ^ sha3(output[i]);
        }
        return sha3(result);
    }

    // getters
    function getNumberOfProblems() constant returns (uint) {
        return problems.length;
    }

    function getProblem(uint problemId) constant returns (address, string) {
        if (problemId >= problems.length) {
            throw;
        }

        Problem problem = problems[problemId];
        return (problem.contractAddress, problem.description);
    }

    function getNumberOfInstances() constant returns (uint) {
        return instances.length;
    }

    function getInstance(uint instanceId) constant returns (address, uint[], uint, InstanceState, bytes32, address, uint[]) {
        if (instanceId >= instances.length) {
            throw;
        }

        Instance instance = instances[instanceId];
        return (instance.contractAddress, instance.input, instance.reward, instance.state, instance.commitmentHash, instance.commitedSolver, instance.solution);
    }
}
