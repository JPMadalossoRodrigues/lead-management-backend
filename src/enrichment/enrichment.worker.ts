import { Injectable, OnModuleInit } from '@nestjs/common';
import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { EnrichmentProcessorService } from './enrichment-processor.service';

type EnrichmentQueueMessage = {
  enrichmentId: number;
  leadId: number;
};

@Injectable()
export class EnrichmentWorker implements OnModuleInit {
  private channel: Channel;
  private connection: ChannelModel;

  constructor(private readonly processor: EnrichmentProcessorService) {}

  async onModuleInit() {
    this.connection = await amqp.connect('amqp://localhost:5672');

    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue('enrichment_queue');

    await this.channel.consume(
      'enrichment_queue',
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
      ) as EnrichmentQueueMessage;

      await this.processor.process(content);

      this.channel.ack(msg);
    } catch (error) {
      console.error('Erro no worker:', error);

      this.channel.nack(msg, false, false);
    }
  }
}
