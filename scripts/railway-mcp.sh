#!/bin/bash
# Railway MCP via direct API (curl)
# Reads RAILWAY_TOKEN from environment variable (set by MCP config)

TOKEN="${RAILWAY_TOKEN}"
API="https://backboard.railway.app/graphql/v2"
PROJECT_ID="${PROJECT_ID:-630de7ba-614a-4cb7-98bf-0fc14f95b88f}"

if [ -z "$TOKEN" ]; then
    echo '{"error": "RAILWAY_TOKEN not set"}'
    exit 1
fi

# Read JSON-RPC request from stdin
read -r REQUEST
METHOD=$(echo "$REQUEST" | grep -o '"method":"[^"]*"' | cut -d'"' -f4)

# Helper: send GraphQL query
q() {
    local query="$1"
    local tmp=$(mktemp)
    printf '{"query":"%s"}' "$query" > "$tmp"
    curl -s "$API" -X POST -H "Content-Type: application/json" -H "authorization: $TOKEN" -d @$tmp
    rm -f "$tmp"
}

case "$METHOD" in
    whoami)
        q 'query{me{id name email}}'
        ;;
    list_projects)
        q 'query{projects{edges{node{id name}}}}'
        ;;
    project_status)
        q 'query{project(id:"'$PROJECT_ID'"){name services{edges{node{id name deployments{edges{node{id status createdAt}}}}}}}}'
        ;;
    list_services)
        q 'query{project(id:"'$PROJECT_ID'"){services{edges{node{id name}}}}}'
        ;;
    get_deployments)
        q 'query{deployments(input:{projectId:"'$PROJECT_ID'"}){edges{node{id status createdAt serviceName}}}}'
        ;;
    get_logs)
        DEPLOY=$(echo "$REQUEST" | grep -o '"deploymentId":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$DEPLOY" ]; then
            q 'query{deploymentLogs(deploymentId:"'$DEPLOY'"limit:20){message timestamp severity}}'
        else
            echo '{"error":"Need deploymentId"}'
        fi
        ;;
    list_variables)
        q 'query{variables(projectId:"'$PROJECT_ID'"){edges{node{name}}}}'
        ;;
    *)
        echo '{"error":"Unknown method: '$METHOD'","available":["whoami","list_projects","project_status","list_services","get_deployments","get_logs","list_variables"]}'
        ;;
esac
