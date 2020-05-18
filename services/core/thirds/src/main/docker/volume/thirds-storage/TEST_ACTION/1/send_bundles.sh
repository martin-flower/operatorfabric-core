#!/bin/bash

CLIENT_ID='opfab-client'
CLIENT_SECRET='opfab-keycloak-secret'
USERNAME='admin'
PASSWORD='test'
KEYCLOAK_TOKEN_ENDPOINT_URL='http://localhost:89/auth/realms/dev/protocol/openid-connect/token'

TOKEN=$( curl -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&username=${USERNAME}&password=${PASSWORD}&grant_type=password" -k ${KEYCLOAK_TOKEN_ENDPOINT_URL} | sed 's/.*access_token":"\(.*\)","expires_in.*/\1/')
echo $TOKEN
rm -f bundle.tar.gz
tar -zcvf bundle.tar.gz config.json css template i18n && curl -X POST "http://localhost:2100/thirds" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -F "file=@bundle.tar.gz;type=application/gzip" -H "Authorization: Bearer $TOKEN"
