/* eslint-disable prettier/prettier */

import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session-dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaimentsService {

    private readonly stripe = new Stripe(envs.stripeSecret)
    private readonly logger = new Logger('PaymentsService')

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ){}

    async createPaymentSession (paymentSessionDto: PaymentSessionDto){
        const { currency, items, orderId } = paymentSessionDto;    

        const lineItems = items.map( item => {
            return {
                price_data: {
                    currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            //? Colocar el id de la orden
            payment_intent_data:{
                metadata:{
                    orderId: orderId
                }
            },

            line_items: lineItems,
            mode: 'payment',
            //TODO colocar en variables de entorno
            success_url:envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl
        })

        //! Por medio del peymentInten si se manda direccion y metodo de pago
/*         const prueba = await this.stripe.paymentIntents.create({
            amount: 1000,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                orderId: '123'
            },
            shipping: {
                name: 'Jenny Rosen',
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',  
            },
        }}) */
            

        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url,
            //prueba
        };
    }

    async stripeWebhook( req: Request, res: Response ){
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;
        // Testin
        const endpointSecret = envs.stripeEndpointSecret;

        // Production
        //const endpointSecret = 'whsec_QDVZ4G7AHeyTWFoSKSlAzvMrRwkXYxJc'
        

        //const endpointSecret = envs.stripeWebhookSecret;
        try {
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'], 
                sig, 
                endpointSecret
            );
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`)
            return;
        }

       //console.log({event}); 
       switch (event.type) {
        case 'charge.succeeded': 

        // TODO llamara nuestro microservicio de ordenes  
        const chargeSucceeded = event.data.object;
        const payload = {
            stripePaymentId: chargeSucceeded.id,
            orderId: chargeSucceeded.metadata.orderId,
            receiptUrl: chargeSucceeded.receipt_url
        }
        //this.logger.log({payload})
        this.client.emit('payment.succeeded', payload)
      break;

     /*  case 'payment_intent.canceled':
        case 'payment_intent.created':
           console.log('INTENT CREATED: ', event.data.object)
        case 'payment_intent.partially_funded':
        case 'payment_intent.payment_failed':
        case 'payment_intent.processing':
        case 'payment_intent.requires_action':
        case 'payment_intent.succeeded': */

      default:
          console.log(`Event  ${event.type} not handled`)
       }

       return res.status(200).json({sig})
    }

}
