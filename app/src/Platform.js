import React from "react";
import ProblemComponent from "./ProblemComponent";
import { Problem, Task } from "./types";
import web3 from "web3";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";
import Collapsible from "react-collapsible";
import NewProblem from "./NewProblem";

import ToggleButton from "react-bootstrap/lib/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/lib/ToggleButtonGroup";

class Platform extends React.Component {
  state = {
    problemKeys: [],
    taskKeys: [],
    problemsCountKey: null,
    tasksCountKey: null,
    showSolved: false
  };

  tasks() {
    const { Main } = this.props.drizzleState.contracts;
    const { taskKeys } = this.state;

    const tasks = [];
    for (var i = 0; i < taskKeys.length; ++i) {
      if (taskKeys[i]) {
        const taskData = Main.getTask[taskKeys[i]];
        if (taskData) {
          const task = new Task(
            i,
            taskData.value[0],
            taskData.value[1],
            taskData.value[2],
            taskData.value[3],
            taskData.value[4],
            taskData.value[5],
            taskData.value[6],
            taskData.value[7],
            taskData.value[8],
            taskData.value[9],
            taskData.value[10]
          );
          tasks.push(task);
        }
      }
    }
    return tasks;
  }

  getData() {
    const { Main } = this.props.drizzleState.contracts;
    const { problemKeys } = this.state;

    const problems = [];
    for (var i = 0; i < problemKeys.length; ++i) {
      if (problemKeys[i]) {
        const problemData = Main.getProblem[problemKeys[i]];
        if (problemData) {
          const problem = new Problem(
            i,
            problemData.value[0],
            problemData.value[1],
            problemData.value[2],
            []
          );
          problems.push(problem);
        }
      }
    }

    const tasks = this.tasks();
    for (var j = 0; j < tasks.length; ++j) {
      const task = tasks[j];
      problems[task.problemId].tasks.push(task);
    }

    return {
      problems: problems,
      tasks: tasks
    };
  }

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.Main;

    const problemsCountKey = contract.methods.getNumberOfProblems.cacheCall();
    const tasksCountKey = contract.methods.getNumberOfTasks.cacheCall();

    this.unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();
      if (drizzleState.drizzleStatus.initialized) {
        const { Main } = drizzleState.contracts;
        const problemsCountData =
          Main.getNumberOfProblems[this.state.problemsCountKey];

        if (problemsCountData) {
          const problemsCount = problemsCountData.value;
          const problemKeys = this.state.problemKeys;

          const currProblemsCount = problemKeys.length;

          if (currProblemsCount < problemsCount) {
            for (var i = currProblemsCount; i < problemsCount; ++i) {
              problemKeys.push(null);
            }
            this.setState({ problemKeys });

            for (var i = currProblemsCount; i < problemsCount; ++i) {
              problemKeys[i] = contract.methods.getProblem.cacheCall(i);
            }
            this.setState({ problemKeys });
          }
        }

        const tasksCountData = Main.getNumberOfTasks[this.state.tasksCountKey];

        if (tasksCountData) {
          const tasksCount = tasksCountData.value;
          const taskKeys = this.state.taskKeys;

          const currTasksCount = taskKeys.length;

          if (currTasksCount < tasksCount) {
            for (var i = currTasksCount; i < tasksCount; ++i) {
              taskKeys.push(null);
            }
            this.setState({ taskKeys });

            for (var i = currTasksCount; i < tasksCount; ++i) {
              taskKeys[i] = contract.methods.getTask.cacheCall(i);
            }
            this.setState({ taskKeys });
          }
        }
      }
    });

    this.setState({ problemsCountKey, tasksCountKey });
  }

  // generates random 256 bits and returns as hex string.
  randomHexNumber = () => {
    var bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    var result = "0x";
    for (var i = 0; i < bytes.length; ++i) {
      var hexByte = web3.utils.toHex(bytes[i]).slice(2);
      while (hexByte.length < 2) {
        hexByte = "0" + hexByte;
      }
      result += hexByte;
    }
    return result;
  };

  getTxStatus = stackId => {
    const { transactions, transactionStack } = this.props.drizzleState;
    const txHash = transactionStack[stackId];
    if (!txHash) return null;
    return transactions[txHash].status;
  };

  xorHex = (a, b) => {
    var result = "0x";
    for (var i = 2; i < a.length; ++i) {
      var x = Number("0x" + a[i]);
      var y = Number("0x" + b[i]);
      result += web3.utils.toHex(x ^ y)[2];
    }

    return result;
  };

  computeCommitmentHash = (address, output) => {
    var result = web3.utils.soliditySha3(address);
    for (var i = 0; i < output.length; ++i) {
      result = this.xorHex(
        result,
        web3.utils.soliditySha3({ type: "uint256", value: output[i] })
      );
    }

    result = web3.utils.soliditySha3(result);
    return result;
  };

  myAddress = () => {
    return this.props.drizzleState.accounts[0];
  };

  commitSolution = (taskId, solution) => {
    const { drizzle, drizzleState } = this.props;
    const { Main } = drizzle.contracts;

    const address = this.myAddress();
    const commitmentHash = this.computeCommitmentHash(address, solution);

    const stackId = Main.methods["commitSolution"].cacheSend(
      taskId,
      commitmentHash,
      {
        from: address,
        gas: 200000
      }
    );

    return () => {
      return this.getTxStatus(stackId);
    };
  };

  newTask = (problemId, input, reward) => {
    const { drizzle } = this.props;
    const { Main } = drizzle.contracts;

    const address = this.myAddress();
    console.log("here");
    const stackId = Main.methods["newTask"].cacheSend(problemId, input, {
      from: address,
      gas: 200000,
      value: reward
    });

    return () => {
      return this.getTxStatus(stackId);
    };
  };

  newProblem = contractAddress => {
    const { drizzle } = this.props;
    const { Main } = drizzle.contracts;

    const address = this.myAddress();

    const stackId = Main.methods["newProblem"].cacheSend(contractAddress, {
      from: address,
      gas: 200000
    });

    return () => {
      return this.getTxStatus(stackId);
    };
  };

  revealSolution = (taskId, solution) => {
    const { drizzle, drizzleState } = this.props;
    const { Main } = drizzle.contracts;

    const address = drizzleState.accounts[0];

    const stackId = Main.methods["revealSolution"].cacheSend(taskId, solution, {
      from: address,
      gas: 2000000
    });

    return () => {
      return this.getTxStatus(stackId);
    };
  };

  handleClick = () => {
    console.log("hi", this.state.showSolved);
    this.setState({ showSolved: !this.state.showSolved });
  };

  handleChange = value => {
    this.setState({ showSolved: value.length > 0 });
  };

  render() {
    if (!this.props.drizzleState) return "";

    const { problems, tasks } = this.getData();

    const problemsComponents = [];
    for (var i = 0; i < problems.length; ++i) {
      problemsComponents.push(
        <ListGroupItem key={i}>
          <ProblemComponent
            problem={problems[i]}
            myAddress={this.myAddress()}
            commitSolution={this.commitSolution}
            revealSolution={this.revealSolution}
            onNewTask={this.newTask}
            showSolved={this.state.showSolved}
          />
        </ListGroupItem>
      );
    }

    const newProblemButton = (
      <h4>
        <span className="fas fa-plus" aria-hidden="true" /> New problem
      </h4>
    );

    const newProblemComponent = (
      <ListGroupItem>
        <Collapsible trigger={newProblemButton} open={false}>
          <NewProblem onNewProblem={this.newProblem} />
        </Collapsible>
      </ListGroupItem>
    );

    return (
      <div className="App">
        <main className="container">
          <ToggleButtonGroup type="checkbox" onChange={this.handleChange}>
            <ToggleButton value={0}>Show solved</ToggleButton>
          </ToggleButtonGroup>
          <ListGroup>
            {problemsComponents}
            {newProblemComponent}
          </ListGroup>
        </main>
      </div>
    );
  }
}

export default Platform;
