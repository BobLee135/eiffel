local-visual:
	cd ./local-visual/visualization && meteor run
easy-event-rabbit:
	cd ./easy-event-rabbit && docker-compose up
custom-sender:
	cd ./custom-sender && node .
bridge:
	cd ./bridge/Rabbit && javac -cp ".:./lib/*" ./src/Rabbit/Rabbit.java && java -cp ".:./lib/*" ./Rabbit/src/Rabbit/Rabbit.java
