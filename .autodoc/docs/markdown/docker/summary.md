[View code on GitHub](https://github.com/oxygenium/oxygenium-web3/.autodoc/docs/json/docker)

The `.autodoc/docs/json/docker` folder contains two important files for the Oxygenium blockchain network: `devnet.conf` and `docker-compose.yml`. These files are essential for configuring the network and deploying it using Docker Compose.

`devnet.conf` is a configuration file that sets various parameters for the Oxygenium blockchain network, such as initial token distribution, consensus rules, network parameters, wallet parameters, mempool parameters, node parameters, and mining parameters. Developers can modify these parameters to suit the requirements of their network. For example, they can change the genesis allocations, consensus parameters, or network parameters by modifying the corresponding objects in the `devnet.conf` file.

`docker-compose.yml` is a Docker Compose file that defines a multi-container application consisting of a Redis backend, a relay service, and an Oxygenium node. This file ensures that the services are started in the correct order and that they are healthy before allowing other services to depend on them. Developers can use this file to deploy the Oxygenium blockchain network on a Docker host, such as a cloud provider or a local machine.

Here's an example of how to use these files to deploy the Oxygenium blockchain network:

1. Modify the `devnet.conf` file to set the desired configuration parameters for your network.
2. Build the custom Docker image for the relay service, if necessary.
3. Run `docker-compose up` in the same directory as the `docker-compose.yml` file to start the Oxygenium blockchain network.

```bash
# Modify the devnet.conf file
# Build the custom Docker image for the relay service (if necessary)
# Start the Oxygenium blockchain network using Docker Compose
docker-compose up
```

In summary, the `.autodoc/docs/json/docker` folder contains essential files for configuring and deploying the Oxygenium blockchain network. Developers can modify the `devnet.conf` file to set various configuration parameters and use the `docker-compose.yml` file to deploy the network using Docker Compose.
