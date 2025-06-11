import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRateEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    currency!: string;

    @Column('decimal', { precision: 10, scale: 4, nullable: true })
    rate!: number | null;

    @Column('decimal', { precision: 10, scale: 4, nullable: true })
    amount!: number | null;

    @Column()
    country!: string;

    @CreateDateColumn()
    lastUpdated!: Date;
} 