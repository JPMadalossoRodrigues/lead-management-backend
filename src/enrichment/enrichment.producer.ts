import { Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class EnrichmentProducer {
  private channel: Channel;
  private connection: ChannelModel;

  async connect() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('enrichment_queue');
  }

  async sendToQueue(message: any) {
    if (!this.channel) {
      await this.connect();
    }
    this.channel.sendToQueue(
      'enrichment_queue',
      Buffer.from(JSON.stringify(message)),
    );
  }
}
