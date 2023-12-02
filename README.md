# Pinorama

Welcome to **Pinorama**, an open-source project designed to enhance log analysis and navigation. This project, currently in its embryonic stage, aims to integrate the power of Pino Logger and Orama Search into a comprehensive logging dashboard. The vision is to eventually attach it to a Fastify endpoint through a plugin.

## Current Stage

At present, I'm in the initial phase of developing the `@pinorama/orama-http-server`. This component is crucial as it lays the foundation for the entire Pinorama ecosystem.

### @pinorama/orama-http-server (in development)

- **Objective**: To create an HTTP server that wraps an Orama instance.
- **Functionality**: It will listen on a specific port, similar to Elasticsearch, focusing on processing incoming log data efficiently.

## Future Scope

Once the `@pinorama/orama-http-server` is operational, I plan to expand the project with the following additional components:

- **@pinorama/orama-http-client**: A client for the server, specialized in handling large volumes of log data through HTTP streams.
- **@pinorama/pino-transport-orama**: A transport layer that integrates Pino Logger with Orama Search.
- **pinorama-web-app**: A React-based user interface for interactive log data visualization and analysis.

## Contact and Support

For any queries or support, feel free to open an issue on GitHub or contact us directly. Your input is crucial in shaping Pinorama into a robust and user-friendly tool for log management.

Thank you for your interest and support in bringing this project to life!

---

I'm look forward to your contributions and collaboration in making Pinorama a good project!
 
