#!/bin/bash

if [ $# -eq 2 ]
    then
        repo="$1"
        codeName="$2"
        echo "Whoo" $# $repo $codeName

elif [ $# -eq 1 ]
    then
        regex="^.+\/(\S+?)$"
        repo="$1"
        [[ "$repo" =~ $regex ]]
        codeName="${BASH_REMATCH[1]}"
else
        echo "Not enough arguments supplied. Should be 'repo-link' and 'code-name'"
        exit 1
fi

projectPath="~/projects/$codeName"
scriptPath="./scripts/$codeName-main.sh"
botUrl="https://api.telegram.org/bot1234/sendMessage?chat_id=1234"

cat << EOF > $scriptPath
#!/bin/bash
set -e

{ # try
    cd $projectPath &&
    git reset --hard &&
    git pull &&
    yarn &&
    yarn build-ts &&
    systemctl --user restart $codeName &&
    curl '${botUrl}&text=✅ $codeName deployed'
} || { # catch
    curl '${botUrl}&text=💥 $codeName failed to deploy'
}
EOF
chmod +x ./scripts/$codeName-main.sh

mkdir -p ~/projects
cd ~/projects
rm -rf $codeName
git clone $repo $codeName

cat << EOF > ~/.config/systemd/user/$codeName.service
[Unit]
Description=Service to start $codeName
After=mongodb.service

[Service]
WorkingDirectory=$projectPath
ExecStart=/usr/bin/yarn distribute
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl --user enable $codeName
systemctl --user start $codeName
