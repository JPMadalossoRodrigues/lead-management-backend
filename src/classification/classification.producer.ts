import { Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class ClassificationProducer {
  private channel: Channel;
  private connection: ChannelModel;

  async connect() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue('classification_queue');
  }

  async sendToQueue(message: any) {
    if (!this.channel) {
      await this.connect();
    }

    this.channel.sendToQueue(
      'classification_queue',
      Buffer.from(JSON.stringify(message)),
    );
  }
}
