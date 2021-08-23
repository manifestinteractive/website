#!/usr/bin/env bash

# @TODO: Figure out why variable setting in script was not working
# would prefer to use TAG rather than run same command three times,
# but this is the only solution that works in production

cat >> ~/.ssh/config  << EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF

ssh -T peterschmalfeldt@manifestinteractive.com << EOF

echo -e "\n\033[38;5;34m✓ Red Van Website › Starting Production Deployment\033[0m\n"

if [ -n "$ZSH_VERSION" ]; then emulate -L ksh && source ~/.zshrc; fi

[[ -s /home/peterschmalfeldt/.nvm/nvm.sh ]] && . /home/peterschmalfeldt/.nvm/nvm.sh

nvm use 8.12.0

cd /var/manifestinteractive.com

echo -e "\n\033[38;5;34m✓ Red Van Website › Updating Production Repository\033[0m\n"

git fetch --tags

if [ -n "$(git describe --tags $(git rev-list --tags --max-count=1))" ]; then
  echo -e "\n\033[38;5;34m✓ Red Van Website › Preparing to Upgrade to $(git describe --tags $(git rev-list --tags --max-count=1))\033[0m\n"

  git reset --hard
  git stash
  git checkout $(git describe --tags $(git rev-list --tags --max-count=1))

  echo -e "\n\033[38;5;34m✓ Red Van Website › Update NPM Packages\033[0m\n"

  npm install

  echo -e "\n\033[38;5;34m✓ Red Van Website › Creating Build\033[0m\n"

  export NODE_ENV=production && ./node_modules/gulp/bin/gulp.js build && ./node_modules/gulp/bin/gulp.js sitemap && npm run -s test && npm run -s cdn
else
  echo -e "\n\033[38;5;34m✓ Red Van Website › No Tagged Release\033[0m\n"
fi

echo -e "\n\033[38;5;34m✓ Red Van Website › Production Deployment Complete\033[0m\n"

EOF
