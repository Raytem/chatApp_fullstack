import { PaginationDto } from "../PaginationDto";

export interface UserFilterDto extends PaginationDto {
  fullName: string,
}