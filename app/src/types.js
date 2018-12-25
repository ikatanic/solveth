class Problem {
    constructor(id, contractAddress, name, description, instances) {
        this.id = id;
        this.contractAddress = contractAddress;
        this.name = name;
        this.description = description;
        this.instances = instances;
    }
}


/*
uint problemId;
address contractAddress;
uint[] input;
uint reward;
instancestate state;

bytes32 commitmentHash;
address commitedSolver;
uint commitTimestamp;

uint[] solution;
*/

class Instance {
    constructor(id, problemId, input, reward, state, commitmentHash, commitedSolver, commitTimestamp, solution) {
        this.id = id;
        this.problemId = problemId;
        this.input = input;
        this.reward = reward;
        this.state = state;
        this.commitmentHash = commitmentHash;
        this.commitedSolver  = commitedSolver;
        this.commitTimestamp = commitTimestamp;
        this.solution = solution;
    }
}

export {Problem, Instance};