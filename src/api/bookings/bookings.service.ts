import { ForbiddenException, Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { subDays } from 'date-fns';
import { InjectModel } from 'nestjs-typegoose';
import { RequestUser } from 'src/app/contracts/RequestUser.interface';
import { DatabaseRepository } from 'src/app/database/DatabaseRepository';
import { AppMessage } from 'src/app/utils/messages.enum';
import { toMongooseObjectId } from 'src/app/utils/mongoose-helper';
import { ProductsService } from '../products/products.service';
import { BOOKING_STATUS } from './contracts/booking-types.enum';
import { BookingListQueryDto } from './dto/booking-list-query.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  private readonly db = new DatabaseRepository(Booking);

  constructor(
    @InjectModel(Booking)
    private readonly model: ReturnModelType<typeof Booking>,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Create a new booking
   * @param payload CreateBookingDto
   * @param authenticatedUser - RequestUser
   * @returns
   */
  async create(payload: CreateBookingDto, authenticatedUser: RequestUser) {
    const productIsAlreadyBooked = await this.model.findOne({
      product: { $eq: payload.product },
      user: { $eq: authenticatedUser.subscriber },
      status: BOOKING_STATUS.CONSUMING,
    });
    if (productIsAlreadyBooked) {
      throw new ForbiddenException(AppMessage.PRODUCT_ALREADY_BOOKED_ERROR);
    }
    return this.model.create({
      product: payload.product,
      user: authenticatedUser.subscriber,
      start_date: payload.start_date,
      estimated_end_date: payload.estimated_end_date,
    });
  }

  /**
   * Get a single booking by id
   * @param id - string
   * @param authenticatedUser - RequestUser
   * @returns
   */
  async myBookingFindOne(id: string, authenticatedUser: RequestUser) {
    return this.db.show({
      find: {
        _id: { $eq: toMongooseObjectId(id) },
        user: { $eq: authenticatedUser.subscriber },
      },
      population: 'product',
    });
  }

  /***
   * Get all bookings for the authenticated user
   */
  async myBookings(
    payload: BookingListQueryDto,
    authenticatedUser: RequestUser,
  ) {
    const __find = {
      user: { $eq: authenticatedUser.subscriber },
    };

    // when status is provided
    if (payload.status) {
      __find['status'] = { $eq: payload.status };
    }
    return this.db.list({
      pagination: {
        limit: payload.limit,
        page: payload.page,
      },
      find: {
        ...__find,
      },
    });
  }

  returnBooking(payload: CreateBookingDto, authenticatedUser: RequestUser) {
    return this.db.update(
      {
        find: {
          product: payload.product,
          user: authenticatedUser.subscriber,
          returned: false,
        },
      },
      { returned: true },
    );
  }
}
