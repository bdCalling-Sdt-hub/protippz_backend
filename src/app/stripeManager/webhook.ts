/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';
import config from '../config';
import { Request, Response } from 'express';
import handlePaymentSuccess from './handlePaymentSuccess';
import updateStripeConnectedAccountStatus from './updateStripeConnectedAccountStatus';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const handleWebhook = async (req: Request, res: Response) => {
  const endpointSecret = config.webhook_endpoint_secret as string;
  const sig = req.headers['stripe-signature'];

  try {
    // Verify the event
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret,
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(paymentIntent.metadata);
        const { userId, paymentPurpose } = paymentIntent.metadata;

        console.log(
          `Payment successful for user ${userId}, subscription ${userId}`,
        );
        await handlePaymentSuccess(userId, paymentPurpose);
        // Update subscription status in your database

        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;

        console.log('accoutn update');
        console.log('accoutn id', account);
        // Check if the account onboarding is complete
        if (account.details_submitted) {
          try {
            // Use the utility function to update the client's status
            await updateStripeConnectedAccountStatus(account.id);
          } catch (err) {
            console.error(
              `Failed to update client status for Stripe account ID: ${account.id}`,
              err,
            );
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, subscriptionId } = paymentIntent.metadata;

        console.log(
          `Payment failed for user ${userId}, subscription ${subscriptionId}`,
        );

        // Notify the user about the failure
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Success');
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default handleWebhook;
