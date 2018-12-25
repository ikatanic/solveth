import React from 'react';
import './App.css';
import Platform from "./Platform";


class App extends React.Component {

  state = { loading: true, drizzleState: null };

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {

      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        let loading = this.state.loading;
        this.setState({ loading: false, drizzleState });
        if (loading) {
          console.log("here")
          const dataKey = drizzle.contracts.Main.methods.getNumberOfProblems.cacheCall();
          this.setState({ dataKey });
        }
      }
    });

  }

  compomentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.loading) return "Loading Drizzle...";

    const { drizzleState, dataKey } = this.state;

    return <Platform drizzle={this.props.drizzle}
      drizzleState={this.state.drizzleState} />

  }
}

export default App;
