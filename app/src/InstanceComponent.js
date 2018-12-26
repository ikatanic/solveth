import React from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

class NameForm extends React.Component {
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
    const { handleSubmit } = this.props;
    handleSubmit(this.state.value);
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

function SolutionSubmitter(props) {
  if (props.submitStatus) {
    if (props.submitStatus() == "success") {
      return (
        <NameForm handleSubmit={props.revealSolution} buttonLabel={"Reveal"} />
      );
    }
  } else {
    if (props.instance.state == 0) {
      return (
        <NameForm handleSubmit={props.commitSolution} buttonLabel={"Commit"} />
      );
    }
  }
  return "";
}

class InstanceComponent extends React.Component {
  state = { submitStatus: null };

  componentDidMount() {}

  commitSolution = solutionString => {
    const { instance, commitSolution } = this.props;
    const solution = solutionString.split(" ").map(Number);
    this.setState({ submitStatus: commitSolution(instance.id, solution) });
  };

  revealSolution = solutionString => {
    const { instance, revealSolution } = this.props;
    const solution = solutionString.split(" ").map(Number);
    this.setState({ submitStatus: revealSolution(instance.id, solution) });
  };

  render() {
    const { instance } = this.props;

    return (
      <div>
        <div>{instance.id}</div>
        <div>reward: {instance.reward}</div>
        <div>state: {instance.state}</div>
        <div>commitedSolver: {instance.commitedSolver}</div>
        <div>commitmentHash: {instance.commitmentHash}</div>
        <div>Input:</div>
        <FormGroup controlId="formControlsTextarea">
          <FormControl value={instance.input} readOnly={true} />
        </FormGroup>

        <TxStatus f={this.state.submitStatus} />
        <SolutionSubmitter
          instance={instance}
          submitStatus={this.state.submitStatus}
          commitSolution={this.commitSolution}
          revealSolution={this.revealSolution}
        />
      </div>
    );
  }
}

export default InstanceComponent;
