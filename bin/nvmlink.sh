#!/usr/bin/env zsh

sudo rm -f /usr/bin/node
sudo rm -f /usr/bin/npm
sudo rm -f /usr/bin/yarn
sudo ln -s $(which node) /usr/bin/
sudo ln -s $(which npm) /usr/bin/
sudo ln -s $(which yarn) /usr/bin/
