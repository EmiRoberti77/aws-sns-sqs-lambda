import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';

export const handler = async (
  event: SQSEvent
): Promise<APIGatewayProxyResultV2> => {
  const messages = event.Records.map((record) => {
    const body = JSON.parse(record.body) as {
      Subject: string;
      Message: string;
    };

    return { subject: body.Subject, message: body.Message };
  });

  const response = {
    body: JSON.stringify({ messages }),
    statusCode: 200,
  };

  console.log(response);
  return response;
};
