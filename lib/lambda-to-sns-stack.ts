import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export interface LambdaToSqsStackProps extends cdk.StackProps {
  topicArn: string;
}

export class LambdaToSqsStack extends cdk.Stack {
  topicArn: string;
  constructor(scope: Construct, id: string, props: LambdaToSqsStackProps) {
    super(scope, id, props);
    this.topicArn = props.topicArn;

    const lambda = new NodejsFunction(this, 'lambda-to-sns-emi-cdk', {
      functionName: 'lambda-to-sns-emi-cdk',
      runtime: Lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(
        __dirname,
        '..',
        'src',
        'lambdas',
        'lambda-to-sns',
        'handler.ts'
      ),
      environment: {
        TopicArn: this.topicArn,
      },
    });

    lambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [this.topicArn],
      })
    );
  }
}
