SQS Example in AWS CDK [SNS, Lambda, DLQ] - Complete Guide

Create an SQS queue in AWS CDK
SQS Queue Event Source for a Lambda Function in AWS CDK
Creating an SQS Dead Letter Queue in AWS CDK

Create an SQS queue that receives messages from an SNS topic. Once our SQS queue receives a message, a Lambda function is triggered.

if error or a message can not be processed from the main que it will be placed in the dead letter queue to be process or handled

Branch: SNS-SQS-LAMBDA ( contains implementation for SNS topic SQS subscribes to SNS and SQS triggers a lambda)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
