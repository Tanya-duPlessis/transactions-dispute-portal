#!/bin/sh
# Railway provides $PORT dynamically — replace the listen directive in nginx config
PORT=${PORT:-80}
sed -i "s/listen 80;/listen $PORT;/" /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
