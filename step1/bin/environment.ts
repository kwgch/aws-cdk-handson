#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EnvironmentStack } from '../lib/environment-stack';

const app = new cdk.App();
new EnvironmentStack(app, 'EnvironmentStack', {
  // スタックをデプロイするリージョンを指定
  env: {
      region: 'ap-northeast-1',
  }
});
