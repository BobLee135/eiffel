# Eiffel student project
## What is this?
This is a collection of four services which work with the Eiffel Protocol:

* easy-event-rabbit: starts the message broker RabbitMQ and can also be used with its endpoints to send events to RabbitMQ.
* custom-sender: creates new events and sends these to 'easy-event-sender', also has a trello hook which can create new events.
* local-visual: stores Eiffel events in a mongoDB as well as creates a visualisation of these events with a graph.
* local-bridge: subscribes to a queue in RabbitMQ and inserts the messages it receives into the database for 'local-visual' to display.


## How to setup
### Prerequisites
* npm
* node
* meteor - `curl https://install.meteor.com/ | sh`
* javac/java - `sudo apt install default-jdk`
* docker desktop - if running windows with wsl
* docker - if running linux
* docker-compose:
  * installation hint: `sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
  * installation hint: `sudo chmod +x /usr/local/bin/docker-compose`

#### 1. Clone the repository
#### 2. Run the following commands:
`cd eiffel/custom-sender && npm install`

`cd ../easy-event-rabbit && npm install` - Do not worry about npm vulnerabilities

`cd ../local-visual/visualization && npm install && cd ../..`

#### 3. Update the ip addresses of linked services
1. Update the variable `EASY_EVENT_RABBIT_IP_ADDRESS` in the file `eiffel/custom-sender/index.js` with the ip of the host running 'easy-event-rabbit'.
  If you are running this locally the value should be `http://localhost:9000`
  Example:![image](https://user-images.githubusercontent.com/48869436/230098646-01ca8053-09bb-4896-9f6a-222ee23ed75f.png)
2. Update the variable in `EASY_EVENT_RABBIT_IP_ADDRESS` in the file `eiffel/local-bridge/Rabbit/src/Rabbit/Rabbit.java` with the ip of the host running 'easy-event-rabbit'.
  If you are running this locally the value should be `localhost`
  Example: ![image](https://user-images.githubusercontent.com/48869436/230100445-1967f201-f335-4f16-a8eb-0666a89a2447.png)

#### 4. Start the services:
When starting up, it is important to run theese commands in different terminals and in order as some of the services depend on each other.

`make easy-event-rabbit`

`make custom-sender` - depends on 'easy-event-rabbit' so waiting a short while after starting it is a good idea.

`make local-visual`

`make local-bridge` - depends on 'local-visual'

#### 5. Access the services
The services should be up and running.

* RabbitMQ: http://localhost:15672
* Event visualization graph: http://localhost:3000
* Visualization database for events: mongodb://localhost:3001/
* Custom-sender endpoint for sending a quick dummy event: http://localhost:3005/testEvent
