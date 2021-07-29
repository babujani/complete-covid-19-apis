const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;

const startServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
startServerAndDb();

//get players
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT player_id AS playerId,
  player_name AS playerName
   FROM player_details;`;
  const playerDetails = await db.all(getAllPlayersQuery);
  response.send(playerDetails);
});
// get a player by id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerByIdQuery = `SELECT player_id AS playerId,
    player_name AS playerName FROM player_details
    WHERE player_id=${playerId};`;
  const playerInfo = await db.get(getPlayerByIdQuery);
  response.send(playerInfo);
});
// put(update) player name for given id
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerNameQuery = `
    UPDATE player_details
    SET player_name='${playerName}'
    WHERE player_id=${playerId}
    ;`;
  await db.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});
// get match by id
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchByIdQuery = `SELECT match_id AS matchId,
    match,year FROM match_details
    WHERE match_id=${matchId};`;
  const matchInfo = await db.get(getMatchByIdQuery);
  response.send(matchInfo);
});
//get all matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT match_id AS matchId,
    match , year
    FROM  player_match_score natural join match_details
    WHERE player_id = ${playerId} 
    ;`;
  const playerMatchDetails = await db.all(getPlayerMatchesQuery);
  response.send(playerMatchDetails);
});
// get players of match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playersOfMatchQuery = `
    SELECT player_id AS playerId, player_name AS playerName
    FROM  player_match_score natural join player_details
    where match_id=${matchId}
    ;`;
  playersOfmatch = await db.all(playersOfMatchQuery);
  response.send(playersOfmatch);
});
//get player total scores
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerScoresQuery = `
    SELECT player_id AS playerId,
    player_name AS playerName,
    sum(score) AS totalScore,sum(fours) AS totalFours,sum(sixes) AS totalSixes
    FROM  player_match_score NATURAL JOIN player_details
    WHERE player_id=${playerId} 
    ;`;
  const playerTotalScore = await db.get(playerScoresQuery);
  response.send(playerTotalScore);
});
module.exports = app;
