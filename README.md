# Ethereum platform for bounty-problem-solving

## What is it?
This is an Ethereum based platform on which users can ask for problem instances to be solved
in exchange for a reward in ether and solve instances themselves.

## Problem and problem instance
**Problem** is defined by the type of its input and output. And by relation between them. For example, 
factorization problem has a positive integer as the input and a positive integer as the output (solution). Output integer 
should be a non-trivial factor of the input integer. Otherwise the solution is incorrect/invalid.

We represent the problem as a text description and an Ethereum contract with one method - solution checking method.
It takes some input and output and validates the solution. See `contracts/Factorization.sol` for an example.

**Problem instance** is a concrete task given as an input to some problem and a reward in ether. The platform ensures that
whoever comes first and submits the solution (which passes the validation by solution checker) gets the reward.
## Developing requirements

Install ethereum test blockchain:
```bash
npm install -g ganache-cli
```
Leave it running (on localhost:8545 by default):
```
ganache-cli
```

Install truffle framework 3.2.5; latest version is not yet supported by this project:
```bash
npm install -g truffle@3.2.5
```

Clone this repository and install node dependencies:
```bash
git clone git@github.com:ikatanic/solveth.git
cd solveth
npm install
```

Deploy contracts onto the test blockchain
```bash
truffle migrate
```

Start the web server:
```
truffle serve
```

Install [MetaMask](https://metamask.io/) extension and configure it to talk to 
the test blockchain you set up.

Now you open `localhost:8080` in your browser to start using the dapp.
