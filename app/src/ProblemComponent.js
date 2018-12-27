import React from "react";
import InstanceComponent from "./InstanceComponent";
import NewInstance from "./NewInstance";

import Collapsible from "react-collapsible";
import Badge from "react-bootstrap/lib/Badge";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";
import EtherScanAddressLink from "./etherscan";

class ProblemComponent extends React.Component {
  componentDidMount() {}

  render() {
    const {
      problem,
      commitSolution,
      revealSolution,
      onNewInstance,
      myAddress
    } = this.props;

    let instancesComponents = [];
    let totalReward = 0;

    // Sort instances.
    // First show unsolved, then solved.
    // Tie by reward.

    const indexes = [];
    for (var i = 0; i < problem.instances.length; ++i) {
      indexes.push(i);
    }

    indexes.sort((i, j) => {
      const iSolved = problem.instances[i].state == 2;
      const jSolved = problem.instances[j].state == 2;
      if (iSolved != jSolved) return iSolved > jSolved;

      return problem.instances[i].reward > problem.instances[j].reward;
    });

    for (var j = 0; j < problem.instances.length; ++j) {
      const i = indexes[j];

      if (!this.props.showSolved && problem.instances[i].state == 2) {
        continue;
      }

      instancesComponents.push(
        <ListGroupItem key={i}>
          <InstanceComponent
            instance={problem.instances[i]}
            commitSolution={commitSolution}
            revealSolution={revealSolution}
            myAddress={myAddress}
          />
        </ListGroupItem>
      );

      totalReward += Number(problem.instances[i].reward);
    }

    let problemTitleClosed = (
      <div className="row">
        <div className="col">
          <h3>{problem.name}</h3>{" "}
        </div>
        <div className="col">
          <Badge className="badge-primary">
            {instancesComponents.length}
            {" instances"}
          </Badge>{" "}
          <Badge className="badge-primary">
            {totalReward / 1e9}
            {" ETH"}
          </Badge>
          {"  "}
        </div>
        <div className="col-">
          <span className="fas fa-angle-down" />
        </div>
      </div>
    );

    let problemTitleOpen = (
      <div className="row">
        <div className="col">
          <h3>{problem.name}</h3>{" "}
        </div>
        <div className="col">
          <Badge className="badge-primary">
            {instancesComponents.length}
            {" instances"}
          </Badge>{" "}
          <Badge className="badge-primary">
            {totalReward / 1e9}
            {" ETH"}
          </Badge>
          {"  "}
        </div>
        <div className="col-">
          <span className="fas fa-angle-up" />
        </div>
      </div>
    );

    const newInstanceButton = (
      <h4>
        <span className="fas fa-plus" aria-hidden="true" /> New instance
      </h4>
    );
    const newInstanceComponent = (
      <ListGroupItem>
        <Collapsible trigger={newInstanceButton} open={false}>
          <NewInstance problemId={problem.id} onNewInstance={onNewInstance} />
        </Collapsible>
      </ListGroupItem>
    );

    return (
      <div className="App">
        <Collapsible
          trigger={problemTitleClosed}
          triggerWhenOpen={problemTitleOpen}
          open={false}
        >
          <div className="container">
            <div>
              {" "}
              <EtherScanAddressLink address={problem.contractAddress} />
            </div>
            <p>{problem.description} </p>
          </div>

          <main className="container">
            <div className="pure-g">
              <ListGroup>
                {instancesComponents}
                {newInstanceComponent}
              </ListGroup>
            </div>
          </main>
        </Collapsible>
      </div>
    );
  }
}

export default ProblemComponent;
