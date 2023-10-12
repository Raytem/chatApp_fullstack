/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common';
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class NotificationService {
  constructor(private scheduleRegistry: SchedulerRegistry) {}

  // @Interval('notification', 5000)
  sendNotificationInterval() {
    console.log('--------Notification message--------');
  }

  createIntervalNotification(name: string, interval: number, callback) {
    const intervalID = setInterval(callback, interval);
    return this.scheduleRegistry.addInterval(name, intervalID);
  }

  deleteIntervalNotification(name) {
    return this.scheduleRegistry.deleteInterval(name);
  }
}
