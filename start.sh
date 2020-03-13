#!/bin/sh
echo "slack_anonymous_bot"

cd ~/slack_anonymous_bot/botkit && forever start slack_bot.js
