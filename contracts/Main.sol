pragma solidity ^0.4.8;

contract ProblemContract {
    function getDescription() public view returns(string);
    function getName() public view returns(string);
    function check(uint[] input, uint[] output) returns (bool);
}

contract Main {
    struct Problem {
        address contractAddress;
        string name;
        string description;
    }

    enum InstanceState {Unsolved, Commited, Solved}

    struct Instance {
        uint problemId;
        uint[] input;
        uint reward;
        InstanceState state;

        bytes32 commitmentHash;
        address commitedSolver;
        uint commitTimestamp;

        uint[] solution;
    }

    Problem[] problems;
    Instance[] instances;

    uint[] emptyArray;

    function newProblem(address contractAddress) {
       problems.push(Problem({
           contractAddress: contractAddress,
           name: ProblemContract(contractAddress).getName(),
           description: ProblemContract(contractAddress).getDescription()
       }));
    }

    function newInstance(uint problemId, uint[] input) payable returns (uint) {
        if (msg.value > 0 && problemId >= 0 && problemId < problems.length) {
            uint instanceId = instances.length;
            instances.push(Instance({
                problemId: problemId,
                input: input,
                reward: msg.value,
                state: InstanceState.Unsolved,
                commitmentHash: 0x0,
                commitedSolver: 0x0,
                commitTimestamp: 0,
                solution: emptyArray
            }));
            return instanceId;
        } else {
            throw;
        }
    }

    function commitExpired(uint instanceId) constant returns (bool) {
        return now >= instances[instanceId].commitTimestamp + 5 minutes;
    }

    function commitSolution(uint instanceId, bytes32 commitmentHash) {
        if (instanceId >= instances.length) {
            throw;
        }
        Instance instance = instances[instanceId]; // reference to instance

        if (instance.state == InstanceState.Unsolved || (instance.state == InstanceState.Commited && commitExpired(instanceId))) {
            instance.state = InstanceState.Commited;
            instance.commitmentHash = commitmentHash;
            instance.commitedSolver = msg.sender;
            instance.commitTimestamp = now;
        } else {
            throw;
        }
    }


    function revealSolution(uint instanceId, uint[] output) {
        require(instanceId < instances.length, "Unknown instanceId");
        
        Instance instance = instances[instanceId]; // reference to the instance
        require(instance.state == InstanceState.Commited, "Instance is not in the commited state");
        require(instance.commitedSolver == msg.sender, "Sender is not the commited solver");

        // verify commitmentHash
        bytes32 commitmentHash = computeCommitmentHash(msg.sender, output);

        require(commitmentHash == instance.commitmentHash, "Revealed solution is not the same as the commited one");

        require(
            ProblemContract(problems[instance.problemId].contractAddress).check(instance.input, output), 
            "Solution is not passing problem's check function"
        );

        // task solved! send reward
        instance.state = InstanceState.Solved;
        instance.solution = output;

        require(msg.sender.send(instance.reward), "Failed to send reward");
    }

    function computeCommitmentHash(address solver, uint[] output) returns (bytes32) {
        bytes32 result = keccak256(solver);
        for (uint i = 0; i < output.length; ++i) {
            result = result ^ keccak256(output[i]);
        }
        return keccak256(result);
    }

    // getters
    function getNumberOfProblems() constant returns (uint) {
        return problems.length;
    }

    function getProblem(uint problemId) constant returns (address, string, string) {
        if (problemId >= problems.length) {
            throw;
        }

        Problem problem = problems[problemId];
        return (problem.contractAddress, problem.name, problem.description);
    }

    function getNumberOfInstances() constant returns (uint) {
        return instances.length;
    }

    function getInstance(uint instanceId) constant returns (uint, uint[], uint, InstanceState, bytes32, address, uint, uint[]) {
        if (instanceId >= instances.length) {
            throw;
        }

        Instance instance = instances[instanceId];
        return (instance.problemId, instance.input, instance.reward, instance.state, instance.commitmentHash, instance.commitedSolver, instance.commitTimestamp, instance.solution);
    }
}
