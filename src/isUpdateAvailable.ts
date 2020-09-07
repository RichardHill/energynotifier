var AWS = require('aws-sdk');
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { DailyPowerReading, PowerReading } from '../daily_power_reading';
import axios, { AxiosResponse } from 'axios';

// The purpse of this Lambda is to simply run a check to see if the is an update to the power data.
// If there is an update then we process the data an acquiesce / stop.
// If there isn't an update then we carry on checking for data....

export const checkPower: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
}