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

if [ -f .env ]
then
    set -o allexport
    source .env
    set +o allexport
fi

if [[ ! -v DEFAULT_BRANCH ]]
then
    DEFAULT_BRANCH="main"
fi
serviceName="$codeName-$DEFAULT_BRANCH"

if [[ ! -v SCRIPTS_PATH ]]
then
    echo "SCRIPTS_PATH value is not defined in the .env file neither as ENV var"
fi
scriptsPath="$(realpath -s $(eval echo $SCRIPTS_PATH))"
scriptPath="$scriptsPath/$serviceName.sh"

if [[ ! -v PROJECTS_PATH ]]
then
    echo "PROJECTS_PATH value is not defined in the .env file neither as ENV var"
fi
projectsPath=$(realpath -s $(eval echo $PROJECTS_PATH))
projectPath="$projectsPath/$serviceName"

if [[ ! -v BOT_URL ]]
then
    BOT_URL="https://api.telegram.org/bot1234/sendMessage?chat_id=1234"
fi

cat << EOF > $scriptPath
#!/bin/bash
set -e

{ # try
    cd $projectPath &&
    git reset --hard &&
    git pull &&
    yarn &&
    yarn build &&
    systemctl --user restart $serviceName &&
    curl '${BOT_URL}&text=✅ $serviceName deployed'
} || { # catch
    curl '${BOT_URL}&text=💥 $serviceName failed to deploy'
}
EOF
chmod +x $scriptPath

mkdir -p $projectsPath
cd $projectsPath
rm -rf $serviceName
git clone $repo $serviceName
cd $projectPath
yarn

cat << EOF > ~/.config/systemd/user/$serviceName.service
[Unit]
Description=Service to start $serviceName
After=mongodb.service

[Service]
WorkingDirectory=$projectPath
ExecStart=/usr/bin/yarn distribute
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

systemctl --user enable $serviceName
systemctl --user start $serviceName
loginctl enable-linger $USER