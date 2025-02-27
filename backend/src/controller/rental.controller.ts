import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateRentalDTO } from 'src/dto/create.rental.dto';
import { RentalDTO } from 'src/dto/rental.dto';
import { Rental } from 'src/entity/rental';
import { RentalService } from 'src/service/rental.service';
import { VINValidationPipe } from 'src/validation/vin.validation.pipe';
import { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Rental')
@Controller()
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @ApiOperation({ summary: 'Get active rentals' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all active rentals.',
    type: [RentalDTO],
    example: [
      {
        startAt: '2025-01-05T11:59:26.000Z',
        endAt: '2026-01-05T11:59:26.000Z',
        car: {
          vin: 'JH4KA4531KC033525',
          brand: 'BMW',
          licensePlate: 'RZ 7728J',
        },
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@doe.com',
          address: {
            street: 'Świętokrzyska',
            city: 'Warszawa',
            country: 'Polska',
            postalCode: '00-001',
            buildingNumber: '33',
          },
        },
      },
    ],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: InternalServerErrorException,
    example: {
      message: 'Internal Server Error',
      statusCode: 500,
    },
  })
  @Get('/rentals/active')
  public async getActiveRentals(): Promise<RentalDTO[]> {
    const rentals: Rental[] = await this.rentalService.getActiveRentals();

    return this.toDTOs(rentals);
  }

  @ApiOperation({ summary: 'Rent a car' })
  @ApiBody({
    type: CreateRentalDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully rent a car.',
    type: RentalDTO,
    example: {
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          street: 'Świętokrzyska',
          city: 'Warszawa',
          country: 'Polska',
          postalCode: '00-001',
          buildingNumber: '33',
        },
      },
      car: {
        vin: 'JH4KA4531KC033525',
        brand: 'BMW',
        licensePlate: 'RZ 7728J',
        status: 'rented',
      },
      startAt: '2024-12-29T15:44:59.000Z',
      endAt: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Inappropriate parameters.',
    type: BadRequestException,
    example: {
      message: 'Inappropriate parameters.',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Car/Customer does not exists.',
    type: NotFoundException,
    example: {
      message: 'Car/Customer does not exists',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: InternalServerErrorException,
    example: {
      message: 'Internal Server Error',
      statusCode: 500,
    },
  })
  @Post('/rental')
  @UsePipes(ValidationPipe)
  public async rent(@Body() dto: CreateRentalDTO): Promise<RentalDTO> {
    const rental: Rental = await this.rentalService.rent(dto);

    return this.toDTO(rental);
  }

  @ApiOperation({ summary: 'Return a car' })
  @ApiParam({
    name: 'vin',
    description: 'VIN of the car to return',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully returned a car.',
    example: {
      message:
        'Car with vin = JH4KA4531KC033525 has been returned successfully.',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Inappropriate parameters.',
    type: BadRequestException,
    example: {
      message: 'Inappropriate parameters.',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Car/Customer does not exists.',
    type: NotFoundException,
    example: {
      message: 'Car/Customer does not exists',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: InternalServerErrorException,
    example: {
      message: 'Internal Server Error',
      statusCode: 500,
    },
  })
  @Put('rental/:vin/return')
  public async return(
    @Param('vin', VINValidationPipe) vin: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.rentalService.return(vin);

    response.status(HttpStatus.OK).send({
      message: `Car with vin = ${vin} has been returned successfully.`,
    });
  }

  private toDTO(rental: Rental): RentalDTO {
    return new RentalDTO(rental);
  }

  private toDTOs(rentals: Rental[]): RentalDTO[] {
    return rentals.map((rental) => this.toDTO(rental));
  }
}
