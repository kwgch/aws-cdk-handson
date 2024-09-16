import { 
  aws_cloudfront as cloudfront, 
  aws_cloudfront_origins as origins, 
  aws_iam as iam,
  Stack, 
  StackProps, 
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path'

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

    // OACの設定
    const originAccessControl = new cloudfront.CfnOriginAccessControl(this, 'MyCfnOriginAccessControl', {
      originAccessControlConfig: {
        name: 'MyOAC',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
        description: `OAC for ${bucket.bucketName}`
      }
    });

    // CloudFrontディストリビューションの設定
    const distribution = new cloudfront.Distribution(this, 'MyCloudFrontDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html',
    })

    // 自動生成されるOAI用バケットポリシーを削除
    const cfnBucket = bucket.policy?.node.defaultChild as s3.CfnBucketPolicy;
    cfnBucket.addPropertyOverride('PolicyDocument.Statement.0', undefined);

    // OACとCloudFrontディストリビューションの紐付け
    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    // 自動生成されるOAI削除
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');
    // 上記で作成したOACを設定
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', originAccessControl.attrId);

    // OACからのアクセスのみ許可するS3バケットポリシーの作成
    const contentsBucketPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.ServicePrincipal('cloudfront.amazonaws.com'),
      ],
      resources: [`${bucket.bucketArn}/*`],
    });
    contentsBucketPolicy.addCondition('StringEquals', {
      'AWS:SourceArn': `arn:aws:cloudfront::${props?.env?.account ?? process.env.AWS_ACCOUNTID}:distribution/${distribution.distributionId}`
    })
    bucket.addToResourcePolicy(contentsBucketPolicy);
  }
}

