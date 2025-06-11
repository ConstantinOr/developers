import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExchangeRate {
    @Field()
    id!: number;

    @Field()
    currency!: string;

    @Field(() => Float, { nullable: true })
    rate!: number | null;

    @Field(() => Float, { nullable: true })
    amount!: number | null;

    @Field()
    country!: string;

    @Field()
    lastUpdated!: Date;
}

export interface CNBResponse {
    rates: {
        currency: string;
        rate: number;
        amount: number;
        country: string;
    }[];
    date: string;
} 