import React from "react";
import ProblemComponent from "./ProblemComponent";
import { Problem, Instance } from "./types";
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
    instanceKeys: [],
    problemsCountKey: null,
    instancesCountKey: null,
    showSolved: false
  };

  instances() {
    const { Main } = this.props.drizzleState.contracts;
    const { instanceKeys } = this.state;

    const instances = [];
    for (var i = 0; i < instanceKeys.length; ++i) {
      if (instanceKeys[i]) {
        const instanceData = Main.getInstance[instanceKeys[i]];
        if (instanceData) {
          const instance = new Instance(
            i,
            instanceData.value[0],
            instanceData.value[1],
            instanceData.value[2],
            instanceData.value[3],
            instanceData.value[4],
            instanceData.value[5],
            instanceData.value[6],
            instanceData.value[7],
            instanceData.value[8],
            instanceData.value[9],
            instanceData.value[10]
          );
          instances.push(instance);
        }
      }
    }
    return instances;
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

    const instances = this.instances();
    for (var j = 0; j < instances.length; ++j) {
      const instance = instances[j];
      problems[instance.problemId].instances.push(instance);
    }

    return {
      problems: problems,
      instances: instances
    };
  }

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.Main;

    const problemsCountKey = contract.methods.getNumberOfProblems.cacheCall();
    const instancesCountKey = contract.methods.getNumberOfInstances.cacheCall();

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

        const instancesCountData =
          Main.getNumberOfInstances[this.state.instancesCountKey];

        if (instancesCountData) {
          const instancesCount = instancesCountData.value;
          const instanceKeys = this.state.instanceKeys;

          const currInstancesCount = instanceKeys.length;

          if (currInstancesCount < instancesCount) {
            for (var i = currInstancesCount; i < instancesCount; ++i) {
              instanceKeys.push(null);
            }
            this.setState({ instanceKeys });

            for (var i = currInstancesCount; i < instancesCount; ++i) {
              instanceKeys[i] = contract.methods.getInstance.cacheCall(i);
            }
            this.setState({ instanceKeys });
          }
        }
      }
    });

    this.setState({ problemsCountKey, instancesCountKey });
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

  commitSolution = (instanceId, solution) => {
    const { drizzle, drizzleState } = this.props;
    const { Main } = drizzle.contracts;

    const address = this.myAddress();
    const commitmentHash = this.computeCommitmentHash(address, solution);

    const stackId = Main.methods["commitSolution"].cacheSend(
      instanceId,
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

  newInstance = (problemId, input, reward) => {
    const { drizzle } = this.props;
    const { Main } = drizzle.contracts;

    const address = this.myAddress();
    console.log("here");
    const stackId = Main.methods["newInstance"].cacheSend(problemId, input, {
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

  revealSolution = (instanceId, solution) => {
    const { drizzle, drizzleState } = this.props;
    const { Main } = drizzle.contracts;

    const address = drizzleState.accounts[0];

    const stackId = Main.methods["revealSolution"].cacheSend(
      instanceId,
      solution,
      {
        from: address,
        gas: 2000000
      }
    );

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

    const { problems, instances } = this.getData();

    const problemsComponents = [];
    for (var i = 0; i < problems.length; ++i) {
      problemsComponents.push(
        <ListGroupItem key={i}>
          <ProblemComponent
            problem={problems[i]}
            myAddress={this.myAddress()}
            commitSolution={this.commitSolution}
            revealSolution={this.revealSolution}
            onNewInstance={this.newInstance}
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
