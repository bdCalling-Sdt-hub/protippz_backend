/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Request, Response } from 'express';
// import fs, { PathLike } from 'fs';
// import csv from 'csv-parser';
// import League from '../modules/league/league.model';
// import Team from '../modules/team/team.model';
// import Player from '../modules/player/player.model';
// const uploadCsvFile = async (req: Request, res: Response) => {
//   const filePath = req?.file?.path;
//   const results: any = [];

//   fs.createReadStream(filePath as PathLike)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', async () => {
//       try {
//         for (const row of results) {
//           const {
//             leagueName,
//             leagueImage,
//             Sport,
//             teamName,
//             teamLogo,
//             teamBgImage,
//             playerName,
//             playerPosition,
//             playerBgImage,
//             playerImage,
//             playerNumber,
//             experience,
//           } = row;

//           // Find or create League
//           let league = await League.findOne({ name: leagueName });
//           if (!league) {
//             league = new League({
//               name: leagueName,
//               league_image: leagueImage,
//               sport: Sport,
//             });
//             await league.save();
//           }

//           // Find or create Team
//           let team = await Team.findOne({ name: teamName, league: league._id });
//           if (!team) {
//             team = new Team({
//               name: teamName,
//               team_logo: teamLogo,
//               team_bg_image: teamBgImage,
//               league: league._id,
//               sport: Sport,
//             });
//             await team.save();
//           }

//           let player = await Player.findOne({
//             name: playerName,
//             position: playerPosition,
//             team: team._id,
//           });
//           if (!player) {
//             // Create Player
//             player = new Player({
//               name: playerName,
//               league: league._id,
//               team: team._id,
//               position: playerPosition,
//               player_image: playerImage,
//               player_bg_image: playerBgImage,
//               jerceyNumber: playerNumber,
//               experience: experience,
//             });
//             await player.save();
//           }
//         }

//         // Delete the file after processing
//         fs.unlinkSync(filePath as PathLike);

//         res.status(200).send('Data successfully uploaded and saved.');
//       } catch (error: any) {
//         res.status(500).send(`Error processing data ${error.message}`);
//       }
//     });
// };

// export default uploadCsvFile;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import fs, { PathLike } from 'fs';
import csv from 'csv-parser';
import League from '../modules/league/league.model';
import Team from '../modules/team/team.model';
import Player from '../modules/player/player.model';
import { getIO } from '../socket/socketManager';
import unlinkFile from '../utilities/unlinkFile';

let uploadCanceled = false;

export const stopCsvUpload = async (req: Request, res: Response) => {
  uploadCanceled = true;
  res.send({ stop: true });
};

const uploadCsvFile = async (req: Request, res: Response) => {
  uploadCanceled = false;
  const filePath = req?.file?.path;
  const results: any[] = [];
  const io = getIO();

  fs.createReadStream(filePath as PathLike)
    .pipe(csv())
    // .on('data', (data) => results.push(data))
    // for solve strine quotes in key
    .on('data', (data) => {
      // Normalize the keys by removing any leading/trailing quotes or spaces around keys
      const normalizedData = Object.keys(data).reduce((acc: any, key) => {
        // Clean the key: remove any quotes or leading/trailing spaces
        const cleanedKey = key.replace(/^['"]|['"]$/g, '').trim();

        // Add the cleaned key-value pair to the accumulator
        acc[cleanedKey] = data[key];
        return acc;
      }, {});

      results.push(normalizedData);
    })
    .on('end', async () => {
      try {
        let count = 0;
        for (const row of results) {
          if (uploadCanceled) {
            break;
          }
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
            playerNumber,
            experience,
          } = row;

          // Upsert League
          const league = await League.findOneAndUpdate(
            { name: leagueName },
            {
              name: leagueName,
              league_image: leagueImage,
              sport: Sport,
            },
            { upsert: true, new: true },
          );

          // Upsert Team
          const team = await Team.findOneAndUpdate(
            { name: teamName, league: league._id },
            {
              name: teamName,
              team_logo: teamLogo,
              team_bg_image: teamBgImage,
              league: league._id,
              sport: Sport,
            },
            { upsert: true, new: true },
          );

          // Upsert Player
          await Player.findOneAndUpdate(
            {
              name: playerName,
              // position: playerPosition,
              // team: team._id,
            },
            {
              name: playerName,
              league: league._id,
              team: team._id,
              position: playerPosition,
              player_image: playerImage,
              player_bg_image: playerBgImage,
              jerceyNumber: playerNumber && Number(playerNumber),
              experience: experience,
            },
            { upsert: true, new: true },
          );
          count++;
          io.emit('upload-progress', {
            total: results?.length,
            completed: count,
          });
        }

        // Delete file after processing
        // fs.unlinkSync(filePath as PathLike);
        unlinkFile(filePath as string);

        res.status(200).send({
          success: true,
          message: 'Data successfully uploaded and saved.',
        });
      } catch (error: any) {
        res
          .status(500)
          .send({ message: `Error processing data: ${error.message}` });
      }
    });
};

export default uploadCsvFile;
