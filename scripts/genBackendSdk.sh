URL=$1
OUTPUT_DIR=$2
FILE_NAME=$3

npx swagger-typescript-api generate \
    -p $URL \
    -o $OUTPUT_DIR \
    -n $FILE_NAME \
    --api-class-name Sdk \
    --union-enums \
    --enum-names-as-values \
    --module-name-first-tag \
    --axios

rm $OUTPUT_DIR$FILE_NAME-e
