#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnsSqsLambdaStack } from '../lib/sns-sqs-lambda-stack';
import {
  LambdaToSqsStack,
  LambdaToSqsStackProps,
} from '../lib/lambda-to-sns-stack';

const app = new cdk.App();
const stack = new SnsSqsLambdaStack(app, 'SnsSqsLambdaStack');
new LambdaToSqsStack(app, 'LambdaToSqsStack', {
  topicArn: stack.topicArn,
} as LambdaToSqsStackProps);
