pragma solidity ^0.4.24;

contract TravellingSalesman {
    string constant name = "Travelling Salesman";
    string constant description = "Find a short travelling salesman route";
    
    function getName() public view returns(string) {
        return name;
    }

    function getDescription() public view returns(string) {
        return description;
    }

    function check(uint[] input, uint[] output) public pure returns (bool) {
        // Input format is: N M L a_1 b_1 c_1 ... a_M b_M c_M
        // where N is number of nodes (indexed 1..N), M is number of edges, L is upper bound on route length.
        // i-th edge has length c_i and goes from a_i to b_i.

        if (input.length < 3) {
            return false;
        }
        uint N = input[0];
        uint M = input[1];
        uint L = input[2];

        if (input.length != 3 + 3*M) {
            return false;
        }
        if (output.length != N) {
            return false;
        }

        uint route_length = 0;
        bool route_good = true;

        for (uint i = 0; i < N && route_good; ++i) {
            uint x = output[i];
            for (uint k = 0; k < i; ++k) {
                if (x == output[k]) {
                    return false;
                }
            }

            uint y = output[(i + 1) % N];

            bool edge_found = false;
            uint edge_length = 0;
            for (uint j = 0; j < M; ++j) {
                if (x == input[3 + j*3] && y == input[3 + j*3 + 1]) {
                    edge_found = true;
                    edge_length = input[3 + j*3 + 2];
                    break;
                }
            }

            route_good = route_good && edge_found;
            route_length += edge_length;
        }
        route_good = route_good && (route_length < L);
        return route_good;
    }
}
