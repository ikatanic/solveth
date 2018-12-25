import React from "react";

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    const {handleSubmit} = this.props;
    handleSubmit(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value={this.props.buttonLabel} />
      </form>
    );
  }
}

function TxStatus(props) {
  if (props.f) {
    return <div>{props.f()}</div>
  } else {
    return "";
  }
}

function SolutionSubmitter(props) {
  if (props.submitStatus) {
    if (props.submitStatus() == "success") {
      return <NameForm handleSubmit={props.revealSolution} buttonLabel={"Reveal"}></NameForm>;   
    }
  } else {
    if (props.instance.state == 0) {
      return <NameForm handleSubmit={props.commitSolution} buttonLabel={"Commit"}></NameForm>; 
    }
  }
  return "";
}

class InstanceComponent extends React.Component {
  state = {submitStatus: null}

  componentDidMount() {
  }

  commitSolution = (solutionString) => {
    const {instance, commitSolution} = this.props;
    const solution = solutionString.split(' ').map(Number);
    this.setState({submitStatus: commitSolution(instance.id, solution)});
  }

  revealSolution = (solutionString) => {
    const {instance, revealSolution} = this.props;
    const solution = solutionString.split(' ').map(Number);
    this.setState({submitStatus: revealSolution(instance.id, solution)});
  }

  render() {
    const {instance} = this.props;

    return  <div>
      <div>{instance.id}</div>
      <div>{instance.input}</div>
      <div>reward: {instance.reward}</div>
      <div>state: {instance.state}</div>
      <div>commitedSolver: {instance.commitedSolver}</div>
      <div>commitmentHash: {instance.commitmentHash}</div>
      <TxStatus f={this.state.submitStatus}/>
      <SolutionSubmitter 
      instance={instance} 
      submitStatus={this.state.submitStatus} 
      commitSolution={this.commitSolution}
      revealSolution={this.revealSolution}
      ></SolutionSubmitter>
    </div>
    ;
  }
}

//      <button onClick={this.commitSolution} disabled={!!this.state.submitStatus }>Commit</button>

export default InstanceComponent;