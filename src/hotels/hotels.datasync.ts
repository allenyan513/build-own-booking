import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as PgPubsub from 'pg-pubsub';

@Injectable()
export class DataSyncService implements OnModuleInit {
  private pubsub: PgPubsub;
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.subscribeToPostgreSQLChanges();
  }

  private async subscribeToPostgreSQLChanges() {
    this.pubsub = new PgPubsub({
      connectionString: process.env.DATABASE_URL,
    });
    this.pubsub
      .addChannel('hotel_table_change', (payload: any) => {
        console.log(
          `Received notification on channel : ${JSON.stringify(payload)}`,
        );
        // 处理数据库变化
      })
      .then(() => {
        console.log('Subscribed to table_change channel');
      })
      .catch((error) => {
        console.error(error);
      });
    // await this.prismaService.$subscribe('post', 'mutation', (event) => {
    //   const changedData = event.data;
    // });
  }
}
