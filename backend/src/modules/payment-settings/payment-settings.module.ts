import { Module } from '@nestjs/common';
import { PaymentSettingsController } from './payment-settings.controller';

@Module({ controllers: [PaymentSettingsController] })
export class PaymentSettingsModule {}
