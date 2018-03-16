module.exports = {
    networks: {
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*" // Match any network id
        },
        chainskills: {
            host: "localhost",
            port: 8545,
            network_id: "4224", // Match any network id
            gas: 4700000
        }
    }
};
