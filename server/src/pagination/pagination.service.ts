import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { TypeOrmPagination } from 'src/interfaces/typeorm-pagination.interface';

@Injectable({})
export class PaginationService {
  getPagination(dto: PaginationDto, defaultPerPage = 20): TypeOrmPagination {
    const page = dto?.page || 1;
    const perPage = dto?.perPage || defaultPerPage;

    const skip = (page - 1) * perPage;

    return {
      skip,
      take: perPage,
    };
  }
}
