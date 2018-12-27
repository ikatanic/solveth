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
        uint creationTimestamp;

        InstanceState state;

        uint commitCount;
        bytes32 commitmentHash;
        address commitedSolver;
        uint commitTimestamp;

        uint[] solution;
    }

    Problem[] problems;
    Instance[] instances;

    uint[] emptyArray;

    function newProblem(address contractAddress) returns (uint) {
       uint problemId = problems.length;
       problems.push(Problem({
           contractAddress: contractAddress,
           name: ProblemContract(contractAddress).getName(),
           description: ProblemContract(contractAddress).getDescription()
       }));
       return problemId;
    }

    function newInstance(uint problemId, uint[] input) payable returns (uint) {
        if (msg.value > 0 && problemId >= 0 && problemId < problems.length) {
            uint instanceId = instances.length;
            instances.push(Instance({
                problemId: problemId,
                input: input,
                reward: msg.value,
                creationTimestamp: now,
                state: InstanceState.Unsolved,
                commitCount: 0,
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
        return now >= instances[instanceId].commitTimestamp + 1 minutes;
    }

    function getInstanceState(uint instanceId) constant returns (InstanceState) {
        Instance instance = instances[instanceId]; // reference to instance
        if (instance.state == InstanceState.Commited && commitExpired(instanceId)) {
            return InstanceState.Unsolved;
        }
        return instance.state;
    }

    function commitSolution(uint instanceId, bytes32 commitmentHash) {
        if (instanceId >= instances.length) {
            throw;
        }

        if (getInstanceState(instanceId) == InstanceState.Unsolved) {
            Instance instance = instances[instanceId]; // reference to instance
            instance.state = InstanceState.Commited;
            instance.commitmentHash = commitmentHash;
            instance.commitedSolver = msg.sender;
            instance.commitTimestamp = now;
            instance.commitCount++;
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
        instance.commitTimestamp = now;
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

    function getInstance(uint instanceId) constant returns (uint, uint[], uint, uint, InstanceState, uint, bytes32, address, uint, uint[]) {
        if (instanceId >= instances.length) {
            throw;
        }

        Instance instance = instances[instanceId];
        
        InstanceState instanceState = getInstanceState(instanceId);

        return (
            instance.problemId, 
            instance.input, 
            instance.reward, 
            instance.creationTimestamp, 
            instanceState,
            instance.commitCount,
            instance.commitmentHash, 
            instance.commitedSolver, 
            instance.commitTimestamp, 
            instance.solution
        );
    }
}
