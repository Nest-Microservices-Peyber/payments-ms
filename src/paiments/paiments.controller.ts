/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Req, Res,  } from '@nestjs/common';
//import { Body, Controller, Get, Post  } from '@nestjs/common';
import { PaimentsService } from './paiments.service';
import { PaymentSessionDto } from './dto/payment-session-dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('paiments')
export class PaimentsController {
  constructor(private readonly paimentsService: PaimentsService) {}

  //@Post('create-payments-session')
  @MessagePattern('create.payments.session')
  createPaymentsSession( @Payload() paymentSessionDto:PaymentSessionDto){
    
    //return paymentSessionDto;
    return this.paimentsService.createPaymentSession(paymentSessionDto);
    //return  'createPaymentsSession'
    
  }

  @Get('success')
  success(){
    return {
      status: true,
      message: 'Payment successful'
    }
  }

  @Get('cancel')
  cancel(){
    return {
      status: false,
      message: 'Payment canceled'
    }
  }

  @Post('webhook')
  async strypeWebhook(@Req() req: Request, @Res() res: Response){
    //async strypeWebhook(){
    //console.log('webhook llamado');
    return this.paimentsService.stripeWebhook(req, res)
  }

}
