import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';

const dynamodbClient = new DynamoDBClient({
  region: 'ap-northeast-1',
});

// ここで、↑で初期化したDynamoDBClientを用いてDynamoDBDocumentClientを初期化
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

interface RegistrationResponse {
  statusCode: number;
  body: string;
}

exports.handler = async (event: any): Promise<RegistrationResponse> => {
  const tableName = process.env.TABLE_NAME;
  const body = JSON.parse(event.body);
  const params: PutCommandInput = {
    TableName: tableName,
    Item: {
      training: body.training,
      email: body.email,
      name: body.name,
      company: body.company,
    },
  };

  const command = new PutCommand(params);
  try {
      await docClient.send(command);
      return {
          statusCode: 201,
          body: 'success',
      };
  } catch (err) {
      return {
          statusCode: 500,
          body: JSON.stringify({
              message: 'some error happened: ' + err,
          }),
      };
  }
};
