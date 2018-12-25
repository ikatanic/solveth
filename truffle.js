module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*' // Match any network id
        },
        "live": {
            network_id: 1,
            host: "localhost",
            port: 8546   // Different than the default below
        },
        "ropsten": {
            network_id: 3,
            host: "localhost",
            port: 8547,
            from: "0x3c5cdb5c1066480ab4e87406561413976ddbb904"
        }
    }
}
