import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path'
import { PolicyStatement, Effect, ArnPrincipal } from 'aws-cdk-lib/aws-iam';

const today = new Date;
const date = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
const name = 'kwgch';

export class EnvironmentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'Step1Bucket', {
      // パブリックアクセスは遮断
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: `${date}-${name}-step1`,
    });

    const deployment = new s3deploy.BucketDeployment(this, 'UploadStaticContents', {
      sources: [s3deploy.Source.asset(path.join('./contents.zip'))], 
      destinationBucket: bucket, 
    });
  }
}
