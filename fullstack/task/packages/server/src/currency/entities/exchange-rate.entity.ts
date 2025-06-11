import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    currency!: string;

    @Column('decimal', { precision: 10, scale: 4 })
    rate!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    expiresAt!: Date;
} 