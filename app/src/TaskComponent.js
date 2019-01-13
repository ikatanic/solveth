import React from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import EtherScanAddressLink from "./etherscan";
import { stringify } from "querystring";
import Badge from "react-bootstrap/lib/Badge";

class SolutionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input
            type="textarea"
            className="form-control"
            placeholder="Enter solution"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </label>
        <input
          className="btn btn-primary btn-sm m-2"
          type="submit"
          value={this.props.buttonLabel}
        />
      </form>
    );
  }
}

function TxStatus(props) {
  if (props.f) {
    return <div>{props.f()}</div>;
  } else {
    return "";
  }
}

class TaskComponent extends React.Component {
  state = { submitStatus: null };

  componentDidMount() {}

  commitSolution = solutionString => {
    const { task, commitSolution } = this.props;
    const solution = solutionString.split(" ").map(Number);
    this.setState({ submitStatus: commitSolution(task.id, solution) });
  };

  revealSolution = solutionString => {
    const { task, revealSolution } = this.props;
    const solution = solutionString.split(" ").map(Number);
    this.setState({ submitStatus: revealSolution(task.id, solution) });
  };

  render() {
    const { task, myAddress } = this.props;

    const taskHeader = (
      <div>
        <div className="row">
          <div className="col">
            <Badge className="badge-primary">
              {task.reward / 1e9}
              {" ETH"}
            </Badge>
            {"  "}
            <Badge className="badge-primary">
              {task.commitCount}
              {" attempts"}
            </Badge>{" "}
            {task.state == 2 && (
              <span
                className="fas fa-check"
                data-toggle="tooltip"
                data-placement="top"
                title="Solved"
              />
            )}
          </div>
          <div className="col-">
            <span className="fas fa-angle-up" />
          </div>
        </div>

        <div>
          Input:
          <FormGroup controlId="formControlsTextarea">
            <FormControl value={task.input} readOnly={true} />
          </FormGroup>
        </div>
      </div>
    );

    const solutionForm = (
      <SolutionForm
        onSubmit={task.state == 0 ? this.commitSolution : this.revealSolution}
        buttonLabel={task.state == 0 ? "Commit" : "Reveal"}
      />
    );

    let taskBody;

    if (task.state == 0) {
      // Unsolved
      taskBody = (
        <div>
          {" "}
          <SolutionForm onSubmit={this.commitSolution} buttonLabel={"Commit"} />
        </div>
      );
    } else if (task.state == 1) {
      // Commited
      const commitDate = new Date(task.commitTimestamp * 1000);

      if (task.commitedSolver == myAddress) {
        // reveal
        taskBody = (
          <div>
            Commited by{" "}
            <EtherScanAddressLink
              address={task.commitedSolver}
              myAddress={myAddress}
            />{" "}
            at {commitDate.toLocaleDateString()}{" "}
            {commitDate.toLocaleTimeString()}.
            <div>
              {" "}
              <SolutionForm
                onSubmit={this.revealSolution}
                buttonLabel={"Reveal"}
              />
            </div>
          </div>
        );
      } else {
        taskBody = (
          <div>
            Commited by{" "}
            <EtherScanAddressLink
              address={task.commitedSolver}
              myAddress={myAddress}
            />{" "}
            at {commitDate.toLocaleDateString()}{" "}
            {commitDate.toLocaleTimeString()}.
          </div>
        );
      }
    } else if (task.state == 2) {
      // Solved
      const commitDate = new Date(task.commitTimestamp * 1000);

      taskBody = (
        <div>
          <div>
            Solved by{" "}
            <EtherScanAddressLink
              address={task.commitedSolver}
              myAddress={myAddress}
            />{" "}
            at {commitDate.toLocaleDateString()}{" "}
            {commitDate.toLocaleTimeString()}.
          </div>
          <div>
            Solution:
            <FormGroup controlId="formControlsTextarea">
              <FormControl value={task.solution} readOnly={true} />
            </FormGroup>
          </div>
        </div>
      );
    }

    return (
      <div>
        {taskHeader}
        {taskBody}
      </div>
    );
  }
}

export default TaskComponent;
