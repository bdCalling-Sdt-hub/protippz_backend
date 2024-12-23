import plaid from 'plaid';

const plaidClient = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox, // Change to `plaid.PlaidEnvironments.production` for live use
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': 'your_plaid_client_id',
        'PLAID-SECRET': 'your_plaid_secret',
      },
    },
  }),
);

export default plaidClient;
