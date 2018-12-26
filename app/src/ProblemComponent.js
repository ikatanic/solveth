import React from "react";
import InstanceComponent from "./InstanceComponent";
import Collapsible from "react-collapsible";
import Badge from "react-bootstrap/lib/Badge";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";
class ProblemComponent extends React.Component {
  componentDidMount() {}

  render() {
    const { problem, commitSolution, revealSolution } = this.props;

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
          />
        </ListGroupItem>
      );

      totalReward += problem.instances[i].reward / 1e9;
    }

    let problemHeader = (
      <div className="container">
        <div className="row">
          <div className="col">
            <h3>{problem.name}</h3>{" "}
          </div>
          <div className="col-sm">
            <Badge className="badge-primary">
              {instancesComponents.length}
              {" instances"}
            </Badge>{" "}
            <Badge className="badge-primary">
              {totalReward}
              {" eth"}
            </Badge>
          </div>
        </div>
        <span>{problem.description} </span>
      </div>
    );

    return (
      <div className="App">
        <Collapsible trigger={problemHeader} open={true}>
          <main className="container">
            <div className="pure-g">
              <ListGroup>{instancesComponents}</ListGroup>
            </div>
          </main>
        </Collapsible>
      </div>
    );
  }
}

export default ProblemComponent;
