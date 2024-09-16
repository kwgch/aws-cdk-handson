#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Step2Stack } from '../lib/step2-stack';

const app = new cdk.App();
new Step2Stack(app, 'Step2Stack', {
   env: {
    region : "ap-northeast-1",
   } 
});
