import { Query, Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}
  private readonly logger = new Logger(MetricsService.name);

  @Get('general/client')
  async getGeneralClient(@Query('clientId') clientId: number) {
    try {

      if (!clientId || isNaN(clientId)) {
        throw new HttpException('Invalid clientId', HttpStatus.BAD_REQUEST);
      }
      const result = await this.metricsService.getClientMetrics(Number(clientId));

      if(!result.valid){
        this.logger.error(`Error en buscar el cliente: ${clientId}`);
        throw new HttpException('Token is not valid', HttpStatus.UNAUTHORIZED)
      }

      return {
        result: {client: result.client , countUsers: result.countUsers, countLastMonthUsers: result.countLastMonthUsers, countUsersActives: result.countUsersActives, countLastMonthLogins: result.countLastMonthLogins},
        message: 'Cliente encontrado',
        status: HttpStatus.OK
      };

      
    } catch (error) {
      console.error('Error en la obtención de métricas del cliente:', error);
      throw new HttpException('Error al obtener métricas del cliente', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post()
  create(@Body() createMetricDto: CreateMetricDto) {
    return this.metricsService.create(createMetricDto);
  }

  @Get()
  findAll() {
    return this.metricsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metricsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetricDto: UpdateMetricDto) {
    return this.metricsService.update(+id, updateMetricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metricsService.remove(+id);
  }
}
