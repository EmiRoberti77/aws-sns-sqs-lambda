import { APIGatewayProxyResultV2, APIGatewayProxyEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
const topic = process.env.TopicArn;
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  const snsCLient = new SNSClient({});

  const topicParams = {
    Message: 'lambda cdk',
    TopicArn: topic,
  };

  await snsCLient.send(new PublishCommand(topicParams));
  const response: APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify({ message: 'ok' }),
  };

  return response;
};
