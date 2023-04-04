.PHONY: easy-event-rabbit
easy-event-rabbit:
	cd ./easy-event-rabbit && docker-compose up

.PHONY: custom-sender
custom-sender:
	cd ./custom-sender && node .

# Run these commands in seperate terminals
# Prerequisites for local-bridge:
#	'local-visual' is already running
#	'easy-event-rabbit' is already running
.PHONY: local-visual
local-visual:
	cd ./local-visual/visualization && meteor run
.PHONY: local-bridge
local-bridge:
	cd ./local-bridge/Rabbit && javac -cp ".:./lib/*" ./src/Rabbit/Rabbit.java && java -cp ".:./lib/*" ./src/Rabbit/Rabbit.java
