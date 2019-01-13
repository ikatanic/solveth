import React from "react";

import web3 from "web3";

class NewTaskForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inputString: "", reward: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    if (event.target.name == "reward") {
      this.setState({ reward: event.target.value });
    } else {
      this.setState({ inputString: event.target.value });
    }
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.inputString, this.state.reward);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <span>
          <label>
            <input
              type="textarea"
              className="form-control"
              placeholder="Enter input"
              value={this.state.inputString}
              onChange={this.handleChange}
            />
          </label>
        </span>
        <span>
          <label>
            Reward:
            <input
              type="text"
              name="reward"
              placeholder="Reward in ETH"
              value={this.state.reward}
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

class NewTask extends React.Component {
  handleNewTask = (inputString, rewardEth) => {
    const { problemId, onNewTask } = this.props;
    const input = inputString.split(" ").map(Number);
    const reward = web3.utils.toWei(rewardEth, "ether");

    this.setState({ submitStatus: onNewTask(problemId, input, reward) });
  };

  render() {
    return (
      <div>
        <NewTaskForm onSubmit={this.handleNewTask} />
      </div>
    );
  }
}

export default NewTask;
