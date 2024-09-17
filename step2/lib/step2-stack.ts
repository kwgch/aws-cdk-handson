import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class Step2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey: { name: 'training', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a Lambda function
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantWriteData(lambdaFunction);

    // API GatewayのREST API作成
    const api = new apigateway.RestApi(this, 'ApplicantApi', {
      restApiName: 'Applicant Service',
      description: 'This service serves applicant data.',
      deployOptions: {
        stageName: 'dev',  // ステージ名を dev に設定
      }
    });

    // 'applicant' リソースを作成
    const applicant = api.root.addResource('applicant');

    // POST メソッドを追加し、Lambda 関数と統合
    const postIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    applicant.addMethod('POST', postIntegration, {
      operationName: 'CreateApplicant',
      methodResponses: [
        { statusCode: '200' },  // 成功時のレスポンス定義
        { statusCode: '400' },  // バリデーションエラー等
      ]
    });
  }
}
