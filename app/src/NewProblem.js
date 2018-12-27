import React from "react";

class NewProblemForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { contractAddress: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ contractAddress: event.target.value });
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.contractAddress);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <span>
          <label>
            <input
              type="text"
              placeholder="Enter contract address"
              value={this.state.contractAddress}
              onChange={this.handleChange}
            />
          </label>
        </span>
        <input
          className="btn btn-primary btn-sm m-2"
          type="submit"
          value="Submit"
        />
      </form>
    );
  }
}

class NewProblem extends React.Component {
  render() {
    return (
      <div>
        <NewProblemForm onSubmit={this.props.onNewProblem} />
      </div>
    );
  }
}

export default NewProblem;
