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

    enum TaskState {Unsolved, Commited, Solved}

    struct Task {
        uint problemId;
        uint[] input;
        uint reward;
        uint creationTimestamp;

        TaskState state;

        uint commitCount;
        bytes32 commitmentHash;
        address commitedSolver;
        uint commitTimestamp;

        uint[] solution;
    }

    Problem[] problems;
    Task[] tasks;

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

    function newTask(uint problemId, uint[] input) payable returns (uint) {
        if (msg.value > 0 && problemId >= 0 && problemId < problems.length) {
            uint taskId = tasks.length;
            tasks.push(Task({
                problemId: problemId,
                input: input,
                reward: msg.value,
                creationTimestamp: now,
                state: TaskState.Unsolved,
                commitCount: 0,
                commitmentHash: 0x0,
                commitedSolver: 0x0,
                commitTimestamp: 0,
                solution: emptyArray
            }));
            return taskId;
        } else {
            throw;
        }
    }

    function commitExpired(uint taskId) constant returns (bool) {
        return now >= tasks[taskId].commitTimestamp + 1 minutes;
    }

    function getTaskState(uint taskId) constant returns (TaskState) {
        Task task = tasks[taskId]; // reference to task
        if (task.state == TaskState.Commited && commitExpired(taskId)) {
            return TaskState.Unsolved;
        }
        return task.state;
    }

    function commitSolution(uint taskId, bytes32 commitmentHash) {
        if (taskId >= tasks.length) {
            throw;
        }

        if (getTaskState(taskId) == TaskState.Unsolved) {
            Task task = tasks[taskId]; // reference to task
            task.state = TaskState.Commited;
            task.commitmentHash = commitmentHash;
            task.commitedSolver = msg.sender;
            task.commitTimestamp = now;
            task.commitCount++;
        } else {
            throw;
        }
    }


    function revealSolution(uint taskId, uint[] output) {
        require(taskId < tasks.length, "Unknown taskId");
        
        Task task = tasks[taskId]; // reference to the task
        require(task.state == TaskState.Commited, "Task is not in the commited state");
        require(task.commitedSolver == msg.sender, "Sender is not the commited solver");

        // verify commitmentHash
        bytes32 commitmentHash = computeCommitmentHash(msg.sender, output);

        require(commitmentHash == task.commitmentHash, "Revealed solution is not the same as the commited one");

        require(
            ProblemContract(problems[task.problemId].contractAddress).check(task.input, output), 
            "Solution is not passing problem's check function"
        );

        // task solved! send reward
        task.state = TaskState.Solved;
        task.commitTimestamp = now;
        task.solution = output;

        require(msg.sender.send(task.reward), "Failed to send reward");
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

    function getNumberOfTasks() constant returns (uint) {
        return tasks.length;
    }

    function getTask(uint taskId) constant returns (uint, uint[], uint, uint, TaskState, uint, bytes32, address, uint, uint[]) {
        if (taskId >= tasks.length) {
            throw;
        }

        Task task = tasks[taskId];
        
        TaskState taskState = getTaskState(taskId);

        return (
            task.problemId, 
            task.input, 
            task.reward, 
            task.creationTimestamp, 
            taskState,
            task.commitCount,
            task.commitmentHash, 
            task.commitedSolver, 
            task.commitTimestamp, 
            task.solution
        );
    }
}
