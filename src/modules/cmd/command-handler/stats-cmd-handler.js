const CommandHandler = require('./cmd-handler.js').CommandHandler;
const math = require('../../math');

const AVAILABLE_ARGS = [
    "solo",
    "solo-fpp",
    "duo",
    "duo-fpp",
    "squad",
    "squad-fpp"
]

class StatsCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        this.logger.info("Handling stats command!");

        let channelId = cmd.discordUser.channelId;
        let discordId = cmd.discordUser.id;
        let pubgId;
        let pubgPlayerName;
        let regionName = '';

        this.logger.debug("checking if player is registered");

        return db.getRegisteredPlayers({ discord_id: discordId })

            .then(rows => {

                if (rows.length === 0) {
                    return Promise.reject('Player not registered. Try register command first');
                } else if (rows.length > 1) {
                    return Promise.reject('Something really weird happened.');
                }

                pubgId = rows[0].pubg_id;
                pubgPlayerName = rows[0].pubg_name;
                
                return db.getRegions({ id: rows[0].region_id })
            })

            .then(rows => {

                if (rows.length !== 1) {
                    return Promise.reject('Something really weird happened.');
                }

                regionName = rows[0].region_name;

                return pubg.seasons(regionName);
            })

            .then(seasons => {

                this.logger.debug("Successfully fetched seasons data!");

                seasons = seasons.data;
                let currentSeason = seasons.filter(s => {
                    return s.attributes.isCurrentSeason;
                })[0];

                this.logger.debug('Id of current season: ' + currentSeason.id);
                return currentSeason.id;
            })

            .then(seasonId => {

                this.logger.debug("Fetching stats...")
                return pubg.playerStats(pubgId, seasonId, regionName);
            })

            .then(stats => {

                this.logger.debug("Successfully fetched stats!");

                let avgStats;
                let message;

         
                if (cmd.arguments.length === 0) {

                    avgStats = this._getAverageStats(stats.data.attributes.gameModeStats)
                    message = this._getStatsAsDiscordFormattedString(pubgPlayerName, "all", avgStats);

                } else if (cmd.arguments.length > 1) {

                    this._onError(bot, channelId, `invalid amount of arguments.`);
                    return;

                } else if (AVAILABLE_ARGS.includes(cmd.arguments[0])) {

                    let gameMode = cmd.arguments[0];
                    let filteredStats = {};

                    filteredStats[gameMode] = stats.data.attributes.gameModeStats[gameMode];

                    avgStats = this._getAverageStats(filteredStats)
                    message = this._getStatsAsDiscordFormattedString(pubgPlayerName, gameMode, avgStats);

                } else {

                    this._onError(bot, channelId, `invalid game mode "${cmd.arguments[0]}"`);
                    return;
                }

                bot.sendMessage({
                    to: channelId,
                    message: message
                });
            })

            .catch(err => {
                this._onError(bot, channelId, err);
            });
    }

    _getAverageStats(gameModeStats) {

        let result = {
            kills: 0,
            assists: 0,
            damageDealt: 0.0,
            wins: 0,
            winPoints: 0.0,
            roundsPlayed: 0
        };
    
        let gameModeCount = 0;
        for (let key in gameModeStats) {
            let gameMode = gameModeStats[key];
    
            result.kills += gameMode.kills;
            result.assists += gameMode.assists;
            result.damageDealt += gameMode.damageDealt;
            result.wins += gameMode.wins;
            result.winPoints += gameMode.winPoints;
            result.roundsPlayed += gameMode.roundsPlayed;
    
            gameModeCount++;
        }
    
        result.avgKills = result.kills / result.roundsPlayed;
        result.avgAssists = result.assists / result.roundsPlayed;
        result.avgDamageDealt = result.damageDealt / result.roundsPlayed;
        result.avgWins = result.wins / result.roundsPlayed;
        result.avgWinPoints = result.winPoints / gameModeCount;
    
        return result;
    }

    _getStatsAsDiscordFormattedString(pubgPlayerName, gameMode, avgStats) {

        let result =
`Season stats for player **${pubgPlayerName}** (game mode: **${gameMode}**):
\`\`\`markdown
- Kills:           ${avgStats.kills} (avg. ${math.round(avgStats.avgKills, 2)})
- Assists:         ${avgStats.assists} (avg. ${math.round(avgStats.avgAssists, 2)})
- Damage:          ${math.round(avgStats.damageDealt, 2)} (avg. ${math.round(avgStats.avgDamageDealt, 2)})
- Wins:            ${avgStats.wins} (avg. ${math.round(avgStats.avgWins, 4)})
- Rounds Played:   ${avgStats.roundsPlayed}
\`\`\``

        return result;
    }
}

exports.getHandler = function() {
    return new StatsCommandHandler();
}