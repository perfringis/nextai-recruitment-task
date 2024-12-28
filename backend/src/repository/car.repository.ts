import { Injectable } from '@nestjs/common';
import { Car } from 'src/entity/car';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CarRepository extends Repository<Car> {
  constructor(private dataSource: DataSource) {
    super(Car, dataSource.createEntityManager());
  }

  public async findAll(): Promise<Car[]> {
    return await this.find({});
  }
}
