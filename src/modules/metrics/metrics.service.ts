import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { DataSource, Repository, Not, IsNull } from 'typeorm';

@Injectable()
export class MetricsService {

  private readonly logger = new Logger(MetricsService.name);

  constructor(
      private dataSource: DataSource,
  ) { }

  async getClientMetrics(clientId: number): Promise<{ valid: boolean; client?: any, countUsers?: number, countLastMonthUsers?: number, countUsersActives?: number, countLastMonthLogins?: number }> {
    try {
      const id = clientId;
  
      if (!id || id <= 0) {
        this.logger.error(`Invalid client ID: ${clientId}`);
        return { valid: false };
      }
  
      let clientData: any = null;
      let countUsers: number = 0;
      let countLastMonthUsers: number = 0;
      let countUsersActives: number = 0;
      let countLastMonthLogins: number = 0;
  
      try {
        await this.dataSource.transaction(async (manager) => {
          const client = await manager.query(
            `SELECT id, name, url_portal, created_at, is_active FROM customers WHERE id = ? AND deleted_at IS NULL`,
            [id]
          );
  
          if (!client || client.length === 0) {
            throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
          }

          const countUsersQuery = await manager.query(
            `SELECT COUNT(*) as count FROM users WHERE client_id = ? AND deleted_at IS NULL`,
            [id]
          );

          countUsers = parseInt(countUsersQuery[0].count);

          const countLastMonthUsersQuery = await manager.query(
            `SELECT COUNT(*) as count FROM users WHERE client_id = ? AND deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
            [id]
          );

          countLastMonthUsers = parseInt(countLastMonthUsersQuery[0].count);

          const countUsersActivesQuery = await manager.query(
            `SELECT COUNT(*) as count FROM users WHERE client_id = ? AND deleted_at IS NULL AND status_validation = 1`,
            [id]
          );

          countUsersActives = parseInt(countUsersActivesQuery[0].count);

          const countLastMonthLoginsQuery = await manager.query(
            `SELECT COUNT(*) as count 
             FROM users 
             WHERE client_id = ? 
               AND deleted_at IS NULL 
               AND last_login_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
            [id]
          );

          countLastMonthLogins = parseInt(countLastMonthLoginsQuery[0].count);
  
          this.logger.log(`Client found: ${JSON.stringify(client[0])}`);
          clientData = client[0]; // Guardamos los datos para devolverlos fuera de la transacción
        });
  
        return { valid: true, client: clientData, countUsers: countUsers, countLastMonthUsers: countLastMonthUsers, countUsersActives: countUsersActives, countLastMonthLogins: countLastMonthLogins };
      } catch (error) {
        console.error('Error en la transacción:', error);
        return { valid: false };
      }
    } catch (error) {
      console.error('Error general:', error);
      return { valid: false };
    }
  }


  create(createMetricDto: CreateMetricDto) {
    return 'This action adds a new metric';
  }

  findAll() {
    return `This action returns all metrics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} metric`;
  }

  update(id: number, updateMetricDto: UpdateMetricDto) {
    return `This action updates a #${id} metric`;
  }

  remove(id: number) {
    return `This action removes a #${id} metric`;
  }
}
