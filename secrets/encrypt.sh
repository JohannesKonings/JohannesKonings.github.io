#!/bin/bash

AGE_PUBLIC_KEY=$1

sops --encrypt --age $AGE_PUBLIC_KEY  -i ./secrets/sopsfile-encrypted.sops.yaml