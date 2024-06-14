#!/bin/bash

AGE_PUBLIC_KEY=$1
SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt --age $AGE_PUBLIC_KEY ./secrets/sopsfile-encrypted.sops.yaml