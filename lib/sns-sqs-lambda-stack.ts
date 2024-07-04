import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SnsSqsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'sqs-emi-cdk-que', {
      queueName: 'sqs-emi-cdk-que',
    });
    const topic = new sns.Topic(this, 'sns-emi-cdk-topic', {
      topicName: 'sns-emi-cdk-topic',
    });
    topic.addSubscription(new subs.SqsSubscription(queue));

    new cdk.CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'ARN for topic',
    });

    const lambda = new NodejsFunction(this, 'lambda-emi-cdk-sqs', {
      functionName: 'lambda-emi-cdk-sqs',
      timeout: cdk.Duration.seconds(15),
      runtime: Lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(
        __dirname,
        '..',
        'src',
        'lambdas',
        'lambda-sqs',
        'handler.ts'
      ),
    });

    lambda.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
      })
    );
  }
}
