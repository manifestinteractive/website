#!/usr/bin/env bash

cat >> ~/.ssh/config  << EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF

ssh -T peterschmalfeldt@manifestinteractive.com << EOF

echo -e "\n\033[38;5;34m✓ Red Van Website › Starting Staging Deployment\033[0m\n"

if [ -n "$ZSH_VERSION" ]; then emulate -L ksh && source ~/.zshrc; fi

[[ -s /home/peterschmalfeldt/.nvm/nvm.sh ]] && . /home/peterschmalfeldt/.nvm/nvm.sh

nvm use 8.12.0

cd /var/dev.manifestinteractive.com

echo -e "\n\033[38;5;34m✓ Red Van Website › Updating Staging Repository\033[0m\n"

git stash
git checkout --force staging
git fetch
git pull

echo -e "\n\033[38;5;34m✓ Red Van Website › Update NPM Packages\033[0m\n"

npm install

echo -e "\n\033[38;5;34m✓ Red Van Website › Creating Build\033[0m\n"
export NODE_ENV=staging && ./node_modules/gulp/bin/gulp.js build && npm run -s test

echo -e "\n\033[38;5;34m✓ Red Van Website › Staging Deployment Complete\033[0m\n"

EOF
