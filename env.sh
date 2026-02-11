#!/bin/sh
# Recreate config file
rm -rf ./dist/env-config.js
touch ./dist/env-config.js

# Add assignment 
echo "window._env_ = {" >> ./dist/env-config.js

# Read each line in .env file
# Each line represents key=value pairs
printenv | grep -E "TWITCH_CLIENT_ID|AUTH_SERVICE_URL|FRONT_URL" | awk -F '=' '{ print "  \"" $1 "\": \"" $2 "\"," }' >> ./dist/env-config.js

echo "}" >> ./dist/env-config.js
