import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'; //追加モジュール
import * as path from 'path' //追加モジュール

// 今日の日付を取得する(yyyyMMdd形式)
const today = new Date;
const date = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;

// 自分の名前を設定する(小文字)
const name = 'kwgch';

export class EnvironmentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3の設定
    const bucket = new s3.Bucket(this, "Step1Bucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: `${date}-${name}-step1`,
    });

    // 以下追加。ローカルファイルを上記のS3へアップロードする。
    const deployment = new s3deploy.BucketDeployment(this, 'UploadStaticContents', {
      sources: [s3deploy.Source.asset(path.join('./contents.zip'))], // npmコマンド実行階層から見てのパスを指定
      destinationBucket: bucket, // 上記のS3を指定
    });
  }
}
