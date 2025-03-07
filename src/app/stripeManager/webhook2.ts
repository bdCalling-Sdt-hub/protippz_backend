/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';
import config from '../config';
import { Request, Response } from 'express';
import updateStripeConnectedAccountStatus from './updateStripeConnectedAccountStatus';
import Log from '../modules/log/log.model';

// const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});
const handleWebhook2 = async (req: Request, res: Response) => {
  const endpointSecret =
    config.webhook_endpoint_secret_for_connected_account as string;
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
      case 'account.updated': {
        console.log('web hook account update');
        const account = event.data.object as Stripe.Account;
        console.log('acount', account);
        if (account.details_submitted) {
          try {
            await updateStripeConnectedAccountStatus(account.id);
          } catch (err) {
            console.error(
              `Failed to update client status for Stripe account ID: ${account.id}`,
              err,
            );
          }
        }
        await Log.create({
          accountId: account.id, // `id` এর পরিবর্তে `accountId` করা ভালো
          message: `Webhook event received for updated account: ${
            account.details_submitted
              ? 'Details submitted: TRUE'
              : 'Details submitted: FALSE'
          }`,
        });
        break;
      }
      case 'account.external_account.updated': {
        console.log('Webhook: External account updated');
        const externalAccount = event.data.object;
        console.log('External Account:', externalAccount);

        try {
          const account = await stripe.accounts.retrieve(
            externalAccount.account as string,
          );
          if (account.details_submitted) {
            await updateStripeConnectedAccountStatus(account.id);
          }
          await Log.create({
            accountId: account.id,
            message: `Webhook event received for updated account: ${
              account.details_submitted
                ? 'Details submitted: TRUE'
                : 'Details submitted: FALSE'
            }`,
          });
        } catch (err) {
          console.error(
            `Failed to fetch account details for ${externalAccount.account}`,
            err,
          );
        }
        break;
      }
      // nice case
      case 'account.external_account.created': {
        console.log('Connected account created');

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

export default handleWebhook2;
