import plaid from 'plaid';
import config from '../config';

const plaidClient = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox, // Change to `plaid.PlaidEnvironments.production` for live use
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.plaid.client_id,
        'PLAID-SECRET': config.plaid.client_secret,
      },
    },
  }),
);

export default plaidClient;