import React from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import EtherScanAddressLink from "./etherscan";
import { stringify } from "querystring";

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
    const { instance, myAddress } = this.props;

    const instanceHeader = (
      <div>
        <div>id: {instance.id}</div>
        <div>reward: {instance.reward / 1e9} ETH</div>
        <div>attempts: {instance.commitCount}</div>
        <div>
          Input:
          <FormGroup controlId="formControlsTextarea">
            <FormControl value={instance.input} readOnly={true} />
          </FormGroup>
        </div>
      </div>
    );

    const solutionForm = (
      <SolutionForm
        onSubmit={
          instance.state == 0 ? this.commitSolution : this.revealSolution
        }
        buttonLabel={instance.state == 0 ? "Commit" : "Reveal"}
      />
    );

    let instanceBody;

    if (instance.state == 0) {
      // Unsolved
      instanceBody = (
        <div>
          {" "}
          <SolutionForm onSubmit={this.commitSolution} buttonLabel={"Commit"} />
        </div>
      );
    } else if (instance.state == 1) {
      // Commited
      const commitDate = new Date(instance.commitTimestamp * 1000);

      if (instance.commitedSolver == myAddress) {
        // reveal
        instanceBody = (
          <div>
            Commited by{" "}
            <EtherScanAddressLink
              address={instance.commitedSolver}
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
        instanceBody = (
          <div>
            Commited by{" "}
            <EtherScanAddressLink
              address={instance.commitedSolver}
              myAddress={myAddress}
            />{" "}
            at {commitDate.toLocaleDateString()}{" "}
            {commitDate.toLocaleTimeString()}.
          </div>
        );
      }
    } else if (instance.state == 2) {
      // Solved
      const commitDate = new Date(instance.commitTimestamp * 1000);

      instanceBody = (
        <div>
          <div>
            Solved by{" "}
            <EtherScanAddressLink
              address={instance.commitedSolver}
              myAddress={myAddress}
            />{" "}
            at {commitDate.toLocaleDateString()}{" "}
            {commitDate.toLocaleTimeString()}.
          </div>
          <div>
            Solution:
            <FormGroup controlId="formControlsTextarea">
              <FormControl value={instance.solution} readOnly={true} />
            </FormGroup>
          </div>
        </div>
      );
    }

    return (
      <div>
        {instanceHeader}
        {instanceBody}
      </div>
    );
  }
}

export default InstanceComponent;
