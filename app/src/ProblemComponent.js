import React from "react";
import InstanceComponent from "./InstanceComponent";

class ProblemComponent extends React.Component {
  componentDidMount() {
  }

  render() {
    const { problem, commitSolution, revealSolution } = this.props;

    let problemHeader =
      <div>
        <h3>{problem.name}</h3>
        {problem.description}
      </div>;

    let instancesComponents = [];
    for (var i = 0; i < problem.instances.length; ++i) {
      instancesComponents.push(
        <li key={i}>
          <InstanceComponent
            instance={problem.instances[i]}
            commitSolution={commitSolution}
            revealSolution={revealSolution}
          />
        </li>
      );
    }

    return (
      <div className="App">
        <div>{problemHeader}</div>
        <main className="container">
          <div className="pure-g">
            <ul>
              {instancesComponents}
            </ul>
          </div></main></div>
    )

  }
}

export default ProblemComponent;