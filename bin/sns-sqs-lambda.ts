#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnsSqsLambdaStack } from '../lib/sns-sqs-lambda-stack';

const app = new cdk.App();
new SnsSqsLambdaStack(app, 'SnsSqsLambdaStack');
