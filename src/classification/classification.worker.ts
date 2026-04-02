import { Injectable, OnModuleInit } from '@nestjs/common';
import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { ClassificationProcessorService } from './classification-processor.service';

type ClassificationQueueMessage = {
  classificationId: number;
  leadId: number;
};

@Injectable()
export class ClassificationWorker implements OnModuleInit {
  private channel: Channel;
  private connection: ChannelModel;

  constructor(private readonly processor: ClassificationProcessorService) {}

  async onModuleInit() {
    this.connection = await amqp.connect('amqp://localhost:5672');

    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue('classification_queue');

    await this.channel.consume(
      'classification_queue',
      (msg: ConsumeMessage | null) => {
        if (!msg) return;

        void this.handleMessage(msg);
      },
    );
  }

  private async handleMessage(msg: ConsumeMessage) {
    try {
      const content = JSON.parse(
        msg.content.toString(),
      ) as ClassificationQueueMessage;

      await this.processor.process(content);

      this.channel.ack(msg);
    } catch (error) {
      console.error('Erro no worker:', error);

      this.channel.nack(msg, false, false);
    }
  }
}
