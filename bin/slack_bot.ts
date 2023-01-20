#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SlackBotStack } from '../lib/slack_bot-stack';

const app = new cdk.App();
new SlackBotStack(app, 'SlackBotStack');
