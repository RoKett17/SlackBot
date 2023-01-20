import { aws_ses_actions, Stack, StackProps } from 'aws-cdk-lib';
import * as chatbot from 'aws-cdk-lib/aws-chatbot';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Action } from 'aws-cdk-lib/aws-codepipeline';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

export class SlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //creates my s3 bucket
    // const s3bucket = new s3.Bucket(this, 'to-store-test-data', {
    //   blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    //   encryption: BucketEncryption.S3_MANAGED,
    //   enforceSSL: true,
    //   versioned: true,
    //   removalPolicy: RemovalPolicy.DESTROY,
    // });

    //creates teh base slack bot conneccting itto my slack
    const slackBot = new chatbot.SlackChannelConfiguration(this, 'MySlackChannel', {
      slackChannelConfigurationName: 'testing-chabot',
      slackWorkspaceId: 'T04KPL9A2HW',
      slackChannelId: 'C04JZRQMDNX',
    });
    
    //creates sns topic
    const bottopic = new sns.Topic(this, 'chat-topic')

    //adds slack chatbot to sns topic
    //slackChannel.addNotificationTopic(new sns.Topic(this, 'chat topic'));
    slackBot.addNotificationTopic(bottopic);
   
    const alarm = new cloudwatch.Alarm(this, 'Errors', {
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 0,
      evaluationPeriods: 1,
      metric: , //fix
      datapointsToAlarm: 1,
      actionsEnabled: true,
    });

    //triggers alarm to send notifcation to sns topic 
    alarm.addAlarmAction({
      bind(this, alarm) {
        return { alarmActionArn: bottopic.topicArn}
      }
    });

    // alarm.addAlarmAction(
    //   SnsAction.
    // );

    const eventRule = cloudtrail.Trail.onEvent(this, 'MyCloudWatchEvent', {
      description: 'rule is to trigger sns warning when cw sees event pattern',
      ruleName: 'ct-trigger',
  
    });
    
    //creates event pattern for rule to monitor
    eventRule.addEventPattern({
      account: ['985153987954'],
      source: ['aws.s3'],
    });

    eventRule.addTarget(new targets.SnsTopic(bottopic));
  }
}