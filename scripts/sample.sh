#!/bin/bash
set -e

{ # try
  cd ~/projects/sample &&
  git reset --hard &&
  git pull &&
  yarn &&
  yarn build-ts &&
  sudo systemctl restart sample &&
  curl 'https://api.telegram.org/bot1234/sendMessage?chat_id=1234&text=✅ Sample repo deployed'
} || { # catch
  curl 'https://api.telegram.org/bot1234/sendMessage?chat_id=1234&text=💥 Sample repo failed to deploy'
}
