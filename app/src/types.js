class Problem {
  constructor(id, contractAddress, name, description, instances) {
    this.id = id;
    this.contractAddress = contractAddress;
    this.name = name;
    this.description = description;
    this.instances = instances;
  }
}

class Instance {
  constructor(
    id,
    problemId,
    input,
    reward,
    creationTimestamp,
    state,
    commitCount,
    commitmentHash,
    commitedSolver,
    commitTimestamp,
    solution
  ) {
    this.id = id;
    this.problemId = problemId;
    this.input = input;
    this.reward = reward;
    this.creationTimestamp = creationTimestamp;
    this.state = state;
    this.commitCount = commitCount;
    this.commitmentHash = commitmentHash;
    this.commitedSolver = commitedSolver;
    this.commitTimestamp = commitTimestamp;
    this.solution = solution;
  }
}

export { Problem, Instance };
