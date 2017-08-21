# Ethereum platform for bounty-problem-solving

## What?
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
## Requirements
([truffle](https://github.com/trufflesuite/truffle),
[testrpc](https://github.com/ethereumjs/testrpc))

```bash
npm install -g truffle@3.2.5 --prefix /home/user/lib
npm install -g ethereumjs-testrpc

cd solveth
npm install

truffle migrate
truffle serve # Requires testrpc server running somewhere.
```
