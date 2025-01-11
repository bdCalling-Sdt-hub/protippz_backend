/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import plaidClient from '../../utilities/plaidClient';

const exchangePublicToken = async (payload: any) => {
  const { public_token } = payload;

  const tokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token,
  });

  const { access_token, item_id } = tokenResponse.data;
  console.log(access_token, item_id);

  // Store the access_token securely
  return { access_token };
};

const StripeService = {
  exchangePublicToken,
};

export default StripeService;
