import React from "react";
import TaskComponent from "./TaskComponent";
import NewTask from "./NewTask";

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
      onNewTask,
      myAddress
    } = this.props;

    let tasksComponents = [];
    let totalReward = 0;

    // Sort tasks.
    // First show unsolved, then solved.
    // Tie by reward.

    const indexes = [];
    for (var i = 0; i < problem.tasks.length; ++i) {
      indexes.push(i);
    }

    indexes.sort((i, j) => {
      const iSolved = problem.tasks[i].state == 2;
      const jSolved = problem.tasks[j].state == 2;
      if (iSolved != jSolved) return iSolved > jSolved;

      return problem.tasks[i].reward > problem.tasks[j].reward;
    });

    for (var j = 0; j < problem.tasks.length; ++j) {
      const i = indexes[j];

      if (!this.props.showSolved && problem.tasks[i].state == 2) {
        continue;
      }

      tasksComponents.push(
        <ListGroupItem key={i}>
          <TaskComponent
            task={problem.tasks[i]}
            commitSolution={commitSolution}
            revealSolution={revealSolution}
            myAddress={myAddress}
          />
        </ListGroupItem>
      );

      totalReward += Number(problem.tasks[i].reward);
    }

    let problemTitleClosed = (
      <div className="row">
        <div className="col">
          <h3>{problem.name}</h3>{" "}
        </div>
        <div className="col">
          <Badge className="badge-primary">
            {tasksComponents.length}
            {" tasks"}
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
            {tasksComponents.length}
            {" tasks"}
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

    const newTaskButton = (
      <h4>
        <span className="fas fa-plus" aria-hidden="true" /> New task
      </h4>
    );
    const newTaskComponent = (
      <ListGroupItem>
        <Collapsible trigger={newTaskButton} open={false}>
          <NewTask problemId={problem.id} onNewTask={onNewTask} />
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
            {problem.description}
          </div>

          <ListGroup>
            {tasksComponents}
            {newTaskComponent}
          </ListGroup>
        </Collapsible>
      </div>
    );
  }
}

export default ProblemComponent;
