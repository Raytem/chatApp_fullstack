export interface CreateUserDto {
  id:	number;
  name:	string;
  surname:	string;
  email:	string;
  birthday:	Date;
  file?: File;
}