#!/bin/sh
# Replace the port in nginx config with the PORT env variable (Railway sets this)
PORT=${PORT:-8080}
sed -i "s/listen 8080;/listen $PORT;/" /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
