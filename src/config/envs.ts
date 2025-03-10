/* eslint-disable prettier/prettier */

import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
    ENDPOINT_SECRET: string;
    //DATABASE_URL: string;

    //PRODUCTS_MICROSERVICE_HOST: string
    //PRODUCTS_MICROSERVICE_PORT: number

    NATS_SERVERS: string[]; 
    
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),

    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    ENDPOINT_SECRET: joi.string().required(),

    //DATABASE_URL: joi.string().required(),
    //PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
    //PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    
    NATS_SERVERS: joi.array().items( joi.string() ).required(),
    
})
.unknown(true);

const {error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if(error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;


export const envs = {
    port: envVars.PORT,
    stripeSecret: envVars.STRIPE_SECRET,

    stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
    stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
    stripeEndpointSecret: envVars.ENDPOINT_SECRET,
    
    //databaseUrl: envVars.DATABASE_URL,
    //productsMicroservicesHost: envVars.PRODUCTS_MICROSERVICE_HOST,
    //productsMicroservicesPort: envVars.PRODUCTS_MICROSERVICE_PORT,

    natsServers: envVars.NATS_SERVERS
    
}