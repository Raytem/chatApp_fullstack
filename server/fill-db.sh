#!/bin/bash
set -e

gunzip -c ../var/backups/chatapp_db.gz | psql -U postgres -d chatapp_db
