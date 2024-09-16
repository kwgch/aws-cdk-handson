import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class Step2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB resource -------------------

    new dynamodb.Table(this, 'Sample-table', { // 'Sample-table'はStack内で一意
      tableName: "TrainingApplicant", // テーブル名の定義
      partitionKey: { //パーティションキーの定義
        name: 'training',
        type: dynamodb.AttributeType.STRING, // typeはあとNumberとbinary
      },
      sortKey: { // ソートキーの定義
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  // オンデマンド請求
      pointInTimeRecovery: true, // PITRを有効化
      timeToLiveAttribute: 'expired', // TTLの設定
      removalPolicy: cdk.RemovalPolicy.DESTROY, // cdk destroyでDB削除可
    });
  }
}
