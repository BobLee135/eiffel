visualization:
	cd ./eiffel-store/visualization && meteor run
event_sender:
	cd ./simple-event-sender && docker-compose up
event_to_visual_bridge:
	cd ./rabbitmq-eiffel-store/Rabbit && javac -cp ".:./lib/*" ./src/Rabbit/Rabbit.java && java -cp ".:./lib/*" /home/boblee/eiffel/rabbitmq-eiffel-store/Rabbit/src/Rabbit/Rabbit.java
