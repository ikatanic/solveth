pragma solidity ^0.4.24;

contract ProblemContract {
    function getDescription() public view returns(string);
    function getName() public view returns(string);
    function check(uint[] input, uint[] output) public pure returns (bool);
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

    function newProblem(address contractAddress) public returns (uint) {
        uint problemId = problems.length;
        problems.push(Problem({
            contractAddress: contractAddress,
            name: ProblemContract(contractAddress).getName(),
            description: ProblemContract(contractAddress).getDescription()
        }));
        return problemId;
    }

    function newTask(uint problemId, uint[] input) public payable returns (uint) {
        require(msg.value > 0, "Reward must be greater than 0");
        require(problemId >= 0 && problemId < problems.length, "problemId must be valid problem id");

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
    }

    function commitExpired(uint taskId) private view returns (bool) {
        return now >= tasks[taskId].commitTimestamp + 1 minutes;
    }

    function getTaskState(uint taskId) private view returns (TaskState) {
        Task storage task = tasks[taskId]; // reference to task
        if (task.state == TaskState.Commited && commitExpired(taskId)) {
            return TaskState.Unsolved;
        }
        return task.state;
    }

    function commitSolution(uint taskId, bytes32 commitmentHash) public {
        require(taskId >= 0 && taskId < tasks.length, "taskId must be a valid task id");
        require(getTaskState(taskId) == TaskState.Unsolved, "Task must be in the Unsolved state");

        Task storage task = tasks[taskId]; // reference to the task
        task.state = TaskState.Commited;
        task.commitmentHash = commitmentHash;
        task.commitedSolver = msg.sender;
        task.commitTimestamp = now;
        task.commitCount++;
    }

    function revealSolution(uint taskId, uint[] output) public {
        require(taskId >= 0 && taskId < tasks.length, "taskId must be a valid task id");
        
        Task storage task = tasks[taskId]; // reference to the task
        require(task.state == TaskState.Commited, "Task must be in the Commited state");
        require(task.commitedSolver == msg.sender, "Sender must be the commited solver");

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

    function computeCommitmentHash(address solver, uint[] output) private pure returns (bytes32) {
        bytes32 result = keccak256(abi.encodePacked(solver));
        for (uint i = 0; i < output.length; ++i) {
            result = result ^ keccak256(abi.encodePacked(output[i]));
        }
        return keccak256(abi.encodePacked(result));
    }

    // getters
    function getNumberOfProblems() public view returns (uint) {
        return problems.length;
    }

    function getProblem(uint problemId) public view returns (address, string, string) {
        require(problemId >= 0 && problemId < problems.length, "problemId must be valid problem id");

        Problem storage problem = problems[problemId];
        return (problem.contractAddress, problem.name, problem.description);
    }

    function getNumberOfTasks() public view returns (uint) {
        return tasks.length;
    }

    function getTask(uint taskId) public view returns (uint, uint[], uint, uint, TaskState, uint, bytes32, address, uint, uint[]) {
        require(taskId >= 0 && taskId < tasks.length, "taskId must be a valid task id");

        Task storage task = tasks[taskId];

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
