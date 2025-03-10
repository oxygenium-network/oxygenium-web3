[View code on GitHub](https://github.com/oxygenium-network/oxygenium-web3/docker/docker-compose.yml)

This code is a Docker Compose file that defines three services: redis, relay, and oxygenium. Docker Compose is a tool for defining and running multi-container Docker applications. 

The redis service uses the Redis image and exposes port 6379. It depends on the oxygenium service being healthy, which is defined later in the file. The healthcheck for this service runs the command "redis-cli ping" every 5 seconds, with a timeout of 5 seconds, and retries 5 times.

The relay service uses a custom Docker image and exposes port 5555. It depends on the redis service being healthy. The environment variable REDIS_URL is set to "redis://redis:6379/0", which means that the relay service will use the Redis service as its backend. The healthcheck for this service runs the command "wget -qO- http://relay:5000/health" every 5 seconds, with a timeout of 5 seconds, and retries 5 times.

The oxygenium service uses the Oxygenium image and exposes several ports. It sets the ALEPHIUM_LOG_LEVEL and ALEPHIUM_ENABLE_DEBUG_LOGGING environment variables. It also mounts the file "devnet.conf" as "/oxygenium-home/.oxygenium/user.conf" inside the container. The healthcheck for this service runs the command "curl --fail http://127.0.0.1:22973/wallets || exit 1" every 3 seconds, with a timeout of 45 seconds, and retries 10 times.

Overall, this Docker Compose file defines a multi-container application that includes a Redis backend, a relay service, and an Oxygenium node. It ensures that the services are started in the correct order and that they are healthy before allowing other services to depend on them. This file can be used to deploy the application on a Docker host, such as a cloud provider or a local machine.
## Questions: 
 1. What services are being used in this project and how are they configured?
- The project is using Redis, Relay, and Oxygenium services. Redis is configured to run on port 6379 and is dependent on the Oxygenium service being healthy. Relay is using a custom Docker image and is configured to run on port 5555, with a healthcheck that tests the health endpoint of the Relay service. Oxygenium is using a custom Docker image and is configured to run on multiple ports, with a healthcheck that tests the wallets endpoint of the Oxygenium service.

2. What versions of the services are being used in this project?
- The Redis service is using version 6-alpine of the Redis image. The Relay service is using a custom Docker image with the tag hc-dev-3. The Oxygenium service is using version 2.3.1 of the oxygenium/dev-oxygenium image.

3. What environment variables are being set for the Oxygenium service?
- The Oxygenium service is setting the environment variables ALEPHIUM_LOG_LEVEL and ALEPHIUM_ENABLE_DEBUG_LOGGING to DEBUG and true, respectively. These variables control the logging level and enable debug logging for the Oxygenium service.