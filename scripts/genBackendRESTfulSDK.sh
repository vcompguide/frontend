#!/bin/bash

URL=http://localhost:9000/api/docs-json
OUTPUT_DIR="./src/backend/RESTful/"
FILE_NAME="BackendRESTfulSDK.ts"

bash ./scripts/genBackendSdk.sh $URL $OUTPUT_DIR $FILE_NAME
