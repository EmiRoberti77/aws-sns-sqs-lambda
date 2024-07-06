import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SnsSqsLambdaStack extends cdk.Stack {
  public topicArn: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dlqLambda = new NodejsFunction(this, 'lambda-dlq-sqs-emi-cdk-que', {
      functionName: 'lambda-dlq-sqs-emi-cdk-que',
      runtime: Lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(
        __dirname,
        '..',
        'src',
        'lambdas',
        'lambda-dlq-sqs',
        'handler.ts'
      ),
    });

    const deadLetterQueue = new sqs.Queue(this, 'dlg-sqs-emi-cdk-que', {
      queueName: 'dlg-sqs-emi-cdk-que',
      retentionPeriod: cdk.Duration.minutes(30),
    });

    dlqLambda.addEventSource(new SqsEventSource(deadLetterQueue));

    const queue = new sqs.Queue(this, 'sqs-emi-cdk-que', {
      queueName: 'sqs-emi-cdk-que',
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const topic = new sns.Topic(this, 'sns-emi-cdk-topic', {
      topicName: 'sns-emi-cdk-topic',
    });
    topic.addSubscription(new subs.SqsSubscription(queue));

    new cdk.CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'ARN for topic',
    });

    this.topicArn = topic.topicArn;

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

    const apiGatewayRole = new iam.Role(this, 'api-sns-emi-role', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [topic.topicArn],
      })
    );

    const api = new apigateway.RestApi(this, 'api-sns-sqs-lambda', {
      restApiName: 'api-sns-sqs-lambda',
      description:
        'this service will provide a direct integration to an SNS topic',
    });

    const integration = new apigateway.AwsIntegration({
      service: 'sns',
      action: 'Publish',
      options: {
        credentialsRole: apiGatewayRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({ status: 'message sent' }),
            },
          },
        ],
        requestTemplates: {
          'application/json': `
          #set($inputRoot = $input.path('$'))
          {
            "TopicArn": "${topic.topicArn}",
            "Message": "$inputRoot.Message",
            "Subject": "$inputRoot.Subject"
          }`,
        },
      },
    });

    api.root.addMethod('POST', integration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
      ],
    });

    new cdk.CfnOutput(this, 'apiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
