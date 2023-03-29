visual:
	cd ./visual/visualization && meteor run
sender:
	cd ./event-sender && docker-compose up
bridge:
	cd ./bridge/Rabbit && javac -cp ".:./lib/*" ./src/Rabbit/Rabbit.java && java -cp ".:./lib/*" ./Rabbit/src/Rabbit/Rabbit.java
