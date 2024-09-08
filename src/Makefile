HELP_FORMAT = "\033[36m%-20s\033[0m %s\n"

.PHONY: help build run run-detached stop restart clear logs logs-realtime

# Rebuild docker image and start
build:
	docker-compose up --build

# Launch container
run:
	docker-compose up

# Launch container in the background
run-detached:
	docker-compose up -d

# Stop container without deleting them
stop:
	docker-compose stop

# Restart container without rebuilding them
restart:
	docker-compose restart

# Stop and delete running container
clear:
	docker-compose down

# View container logs
logs:
	docker-compose logs

# Open container logs in realtime
logs-realtime:
	docker-compose logs -f

# Display help
help:
	@echo "Available commands:"
	@printf $(HELP_FORMAT) "build" "Rebuild docker image and start"
	@printf $(HELP_FORMAT) "run" "Launch current container"
	@printf $(HELP_FORMAT) "run-detached" "Launch container in the background"
	@printf $(HELP_FORMAT) "stop" "Stop container without deleting them"
	@printf $(HELP_FORMAT) "restart" "Restart container without rebuilding them"
	@printf $(HELP_FORMAT) "clear" "Stop and delete running container"
	@printf $(HELP_FORMAT) "logs" "View container logs"
	@printf $(HELP_FORMAT) "logs-realtime" "Open container logs in realtime"