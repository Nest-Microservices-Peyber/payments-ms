/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session-dto';
import { Request, Response } from 'express';

@Injectable()
export class PaimentsService {

    private readonly stripe = new Stripe(envs.stripeSecret)

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

        return session;
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
        console.log({
            //metadata: chargeSucceeded.metadata,
            orderId: chargeSucceeded.metadata.orderId
        })
        console.log(event)
      break;

      default:
          console.log(`Event  ${event.type} not handled`)
       }

       return res.status(200).json({sig})
    }

}
