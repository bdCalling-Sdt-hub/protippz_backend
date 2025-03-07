import httpStatus from 'http-status';
import AppError from '../error/appError';
import Player from '../modules/player/player.model';
import Team from '../modules/team/team.model';

const updateStripeConnectedAccountStatus = async (accountId: string) => {
  if (!accountId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Stripe account ID is required.',
    );
  }

  try {
    const player = await Player.findOne({ stripAccountId: accountId });
    console.log('player', player);
    const team = await Team.findOne({ stripAccountId: accountId });
    console.log('team', team);
    if (player) {
      const updatedPlayer = await Player.findOneAndUpdate(
        { stripAccountId: accountId },
        { isStripeConnected: true },
        { new: true, runValidators: true },
      );
      console.log('updated player', updatedPlayer);
      if (!updatedPlayer) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `No player found with Stripe account ID: ${accountId}`,
        );
      }
    } else if (team) {
      const updatedTeam = await Team.findOneAndUpdate(
        { stripAccountId: accountId },
        { isStripeConnected: true },
        { new: true, runValidators: true },
      );
      console.log('updated team', updatedTeam);
      if (!updatedTeam) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `No team found with Stripe account ID: ${accountId}`,
        );
      }
    }
  } catch (err) {
    console.log('error someting went wrongn');
    return {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'An error occurred while updating the client status.',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

export default updateStripeConnectedAccountStatus;
