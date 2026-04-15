#!/bin/sh
# Recreate config file
rm -rf ./dist/env-config.js
touch ./dist/env-config.js

# Add assignment 
echo "window._env_ = {" >> ./dist/env-config.js

# Read environment variables explicitly
echo "  \"TWITCH_CLIENT_ID\": \"$TWITCH_CLIENT_ID\"," >> ./dist/env-config.js
echo "  \"AUTH_SERVICE_URL\": \"$AUTH_SERVICE_URL\"," >> ./dist/env-config.js
echo "  \"ACHIEVEMENT_MANAGEMENT_SERVICE_URL\": \"$ACHIEVEMENT_MANAGEMENT_SERVICE_URL\"," >> ./dist/env-config.js
echo "  \"BUCKET_MANAGER_SERVICE_URL\": \"$BUCKET_MANAGER_SERVICE_URL\"," >> ./dist/env-config.js
echo "  \"FRONT_URL\": \"$FRONT_URL\"," >> ./dist/env-config.js

echo "}" >> ./dist/env-config.js
