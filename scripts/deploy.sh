#!/bin/bash
# Multi-Environment Intelligent Deploy Script
# Usage: ./deploy.sh [start|stop|restart|down] [dev|uat|prod]

ACTION=$1
ENV=$2

if [ -z "$ACTION" ] || [ -z "$ENV" ]; then
    echo "Usage: ./deploy.sh [start|stop|restart|down] [dev|uat|prod]"
    exit 1
fi

ENV_FILE=".env.${ENV}"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file ${ENV_FILE} not found!"
    exit 1
fi

echo "=========================================="
echo "Target Environment: ${ENV^^}"
echo "Action: ${ACTION^^}"
echo "=========================================="

# Function to check if a port is in use using standard networking tools
is_port_in_use() {
    local port=$1
    if ! [[ "$port" =~ ^[0-9]+$ ]]; then return 1; fi # Ignore empty ports
    # Use netstat to check if port is bound
    if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
        return 0 # In use
    fi
    return 1 # Available
}

# Function to intelligently scan and update a port in the target env file
update_port_if_conflict() {
    local var_name=$1
    local current_port=$(grep "^${var_name}=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '[:space:]')
    
    if [ -z "$current_port" ]; then
        return # Port not set, skip
    fi

    # Scan forward to find next available port
    local assigned_port=$current_port
    while is_port_in_use $assigned_port; do
        echo "⚠️ Port conflict detected: ${var_name} port ${assigned_port} is already in use by another process."
        assigned_port=$((assigned_port + 1))
        echo "🔍 Scanning next port: ${assigned_port}..."
    done

    # If port changed, update the env file
    if [ "$assigned_port" != "$current_port" ]; then
        echo "✅ Resolved: Assigning new port ${assigned_port} to ${var_name} and updating ${ENV_FILE}."
        # Use sed to update the line in place
        sed -i "s/^${var_name}=.*/${var_name}=${assigned_port}/" "$ENV_FILE"
    fi
}

# Before starting, check for port collisions
if [ "$ACTION" = "start" ] || [ "$ACTION" = "restart" ]; then
    echo "Running intelligent port bind checks..."
    update_port_if_conflict "NGINX_HTTP_PORT"
    update_port_if_conflict "NGINX_HTTPS_PORT"
    update_port_if_conflict "DB_EXTERNAL_PORT"
    update_port_if_conflict "REDIS_EXTERNAL_PORT"
    update_port_if_conflict "API_DEV_PORT"
    update_port_if_conflict "FRONTEND_DEV_PORT"
    echo "Port checks complete."
fi

# Check if base .env exists (for secrets)
if [ ! -f ".env" ]; then
    echo "❌ CRITICAL ERROR: Base '.env' file not found!"
    echo "Since it is in .gitignore, it was not copied to the server."
    echo "You MUST create the '.env' file on the server with your secrets (JWT_SECRET, PAYU_MERCHANT_KEY, etc.) before running this script."
    echo "Deployment aborted."
    exit 1
fi

# Execute docker-compose with BOTH env files (base for secrets, env-specific for ports/names)
if [ "$ENV" = "dev" ]; then
    COMPOSE_CMD="docker-compose --env-file .env --env-file $ENV_FILE -f docker-compose.yml -f docker-compose.dev.yml"
else
    COMPOSE_CMD="docker-compose --env-file .env --env-file $ENV_FILE -f docker-compose.yml"
fi

case $ACTION in
    start)
        echo "Starting ${ENV^^} stack..."
        $COMPOSE_CMD up -d --build
        ;;
    stop)
        echo "Stopping ${ENV^^} stack..."
        $COMPOSE_CMD stop
        ;;
    restart)
        echo "Restarting ${ENV^^} stack..."
        $COMPOSE_CMD down
        $COMPOSE_CMD up -d --build
        ;;
    down)
        echo "Tearing down ${ENV^^} stack (removing containers & networks)..."
        $COMPOSE_CMD down
        ;;
    *)
        echo "Invalid action: $ACTION"
        exit 1
        ;;
esac

echo "=========================================="
echo "Deployment Action '${ACTION}' completed for ${ENV^^}."
echo "Active configuration loaded from ${ENV_FILE} and .env"
echo "=========================================="
