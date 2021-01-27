import { IsNumber, IsOptional, } from "class-validator";
import { TryParseNumber } from "modules/common/validator";

export class PaginatedQuery {
    @TryParseNumber()
    @IsNumber()
    skip: number;

    @TryParseNumber()
    @IsNumber()
    @IsOptional()
    take: number = 15;
}