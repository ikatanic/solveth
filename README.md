# Ethereum platform for bounty problem solving

This is an Ethereum based platform where you can set tasks to be solved
in exchange for a reward in ether or solve other's tasks yourself.

## Definitions

**Problem** is defined by the type of its input and output, and by relation between those two.
For example, factorization problem has a positive integer as the input and a positive integer as the output (solution).
Output integer should be a non-trivial factor of the input integer. Otherwise the solution is not correct.

We represent a problem by an Ethereum smart contract with the following interface:

```
contract ProblemContract {
    function getDescription() public view returns(string);
    function getName() public view returns(string);
    function check(uint[] input, uint[] output) returns (bool);
}
```

Most important method is `check`. It takes some input and output and verifies if given the output is the correct solution to the input.
See `contracts/Factorization.sol` for an example.

Currently, inputs and outputs are restricted to arrays of unsigned integers. This doesn't really make any problems
impossible to use, but it might be awkward to convert arbritrary input types to unsigned integers.

**Task** is an input to a problem, along with some reward in ether. The platform ensures that
whoever comes first and submits the solution to the task (which passes the validation by the solution checker) gets the reward.

## Developing

Backend of this app is composed of several smart contracts (see `contracts/`) that need to be deployed on the Ethereum blockchain.
Frontend is a React+Bootstrap app, see `app/` for details.

Install ethereum test blockchain:

```bash
npm install -g ganache-cli
```

Leave it running (on `localhost:8545` by default):

```
ganache-cli -b 3
```

Install the project:

Clone this repository and install the project:

```bash
git clone git@github.com:ikatanic/solveth.git
cd solveth/app
npm install
```

Deploy contracts onto the test blockchain

```bash
truffle migrate
```

Start the web server:

```
npm start
```

Optionally, install [MetaMask](https://metamask.io/) extension and configure it to talk to
the test blockchain you set up.

Open `localhost:3000` in your browser to start using the dapp.
