#!/bin/sh
# Use BACKEND_URL env var if set (Railway production), otherwise use local docker-compose backend
BACKEND=${BACKEND_URL:-http://backend:4000}
sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND|g" /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
