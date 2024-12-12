import { Request, Response } from 'express';
import fs, { PathLike } from 'fs';
import csv from 'csv-parser';
import League from '../modules/league/league.model';
import Team from '../modules/team/team.model';
import Player from '../modules/player/player.model';

const uploadCsvWithProgress = async (req: Request, res: Response) => {
  console.log('nice to meet you man');
  const filePath = req?.file?.path;

  // Initialize Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const sendProgress = (progress: number) => {
    res.write(`data: ${JSON.stringify({ progress })}\n\n`);
  };

  // Helper function to clean invalid values
  const cleanValue = (value: any) => {
    return value === '#VALUE!' || value === undefined || value === null
      ? ''
      : value;
  };

  // Helper function to process each row
  const processRow = async (row: any) => {
    const {
      leagueName,
      leagueImage,
      Sport,
      teamName,
      teamLogo,
      teamBgImage,
      playerName,
      playerPosition,
      playerBgImage,
      playerImage,
    } = row;

    // Find or create League
    let league = await League.findOne({ name: leagueName });
    if (!league) {
      league = new League({
        name: leagueName,
        league_image: leagueImage,
        sport: Sport,
      });
      await league.save();
    }

    // Find or create Team
    let team = await Team.findOne({ name: teamName, league: league._id });
    if (!team) {
      team = new Team({
        name: teamName,
        team_logo: teamLogo,
        team_bg_image: teamBgImage,
        league: league._id,
      });
      await team.save();
    }

    // Find or create Player
    let player = await Player.findOne({
      name: playerName,
      position: playerPosition,
      team: team._id,
    });

    if (!player) {
      player = new Player({
        name: playerName,
        league: league._id,
        team: team._id,
        position: playerPosition,
        player_image: playerImage,
        player_bg_image: playerBgImage,
      });
      await player.save();
    }
  };

  // Stream the CSV file and read data
  fs.createReadStream(filePath as PathLike)
    .pipe(csv())
    .on('data', async (data) => {
      try {
        const cleanedRow = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, cleanValue(value)]),
        );
        await processRow(cleanedRow);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        res.status(400).json({ error: errorMessage });
        return;
      }
    })
    .on('end', async () => {
      try {
        fs.unlink(filePath as PathLike, (err) => {
          if (err) console.error('Failed to delete file', err);
        });

        // Complete progress
        sendProgress(100);
        res.write(
          `data: ${JSON.stringify({ message: 'Upload complete' })}\n\n`,
        );
        res.end();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        res.status(500).json({ error: errorMessage });
      }
    })
    .on('error', (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ error: errorMessage });
    });
};

export default uploadCsvWithProgress;
