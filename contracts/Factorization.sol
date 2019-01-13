pragma solidity ^0.4.24;

contract Factorization {
    string constant name = "Factorization";
    string constant description = "Find a factor of a number";

    function getName() public view returns(string) {
        return name;
    }

    function getDescription() public view returns(string) {
        return description;
    }

    function check(uint[] input, uint[] output) public pure returns (bool) {
        if (input.length != 1 || output.length != 1) {
            return false;
        }

        uint n = input[0];
        uint factor = output[0];

        if (1 < factor && factor < n && n % factor == 0) {
            return true;
        }

        return false;
    }
}
