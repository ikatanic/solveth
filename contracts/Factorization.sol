pragma solidity ^0.4.8;

contract Factorization {
    function check(uint[] input, uint[] output) returns (bool) {
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
