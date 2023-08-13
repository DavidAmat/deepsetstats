define(["util/signalRController", "axios", "vue"], function (SignalR, Axios, Vue) {

    var LiveScoresUpdater;
    return (LiveScoresUpdater = (function () {
        function LiveScoresUpdater() {
            let defaults = {
                initialLoadUrl: "/-/ajax/Scores/GetInitialScores",
                initialLoadUrlChallenger: "/-/ajax/Scores/GetInitialChallengerScores",
                language: "en"
            };
            this.options = this.Extend(defaults);
            this.signalR = SignalR.getInstance();
            this.vue = Vue;
        }
        LiveScoresUpdater.prototype.Extend = function () {
            for (var i = 1; i < arguments.length; i++)
                for (var key in arguments[i])
                    if (arguments[i].hasOwnProperty(key)) {
                        if (
                            typeof arguments[0][key] === "object" &&
                            typeof arguments[i][key] === "object"
                        )
                            extend(arguments[0][key], arguments[i][key]);
                        else arguments[0][key] = arguments[i][key];
                    }
            return arguments[0];
        };
        LiveScoresUpdater.prototype.updateCurrentTournamentsScoreData = function (tournamentLevel) {
            const self = this;
            const tournaments = self.getScoresGlobalObjectByTournamentLevel(tournamentLevel).tournaments;
            const scoreData = self.getCurrentTournamentsScoreData(tournamentLevel);

            tournaments.forEach(tournament => {
                for (let i = 0; i < tournament.Matches.length; i++) {
                    let getPosition;
                    let lp = tournament.Matches[i].LiveListingPosition === null ? 0 : tournament.Matches[i].LiveListingPosition;

                    if (lp === 1) {
                        getPosition = tournament.Matches[i].LiveListingPosition;
                    }
                    else {
                        getPosition = tournament.Matches[i].RailPosition;
                    }

                    if (getPosition === 1) {
                        if (typeof scoreData.matches[`Event_${tournament.Matches[i].EventId}`] === "undefined") {
                            scoreData.matches[`Event_${tournament.Matches[i].EventId}`] = {};
                        }
                        scoreData.matches[`Event_${tournament.Matches[i].EventId}`].match = tournament.Matches[i];
                        scoreData.matches[`Event_${tournament.Matches[i].EventId}`].isLaverCup = tournament.IsLaverCup;
                    }
                }
            });
        };
        LiveScoresUpdater.prototype.signalRScores = function (tournamentLevel) {
            const self = this;
            self.signalR.registerScoresEvent(tournamentLevel, function (data) {

                if (data === null) {
                    return;
                }
                if (data.type === "match") {
                    const tournament = self.getScoresGlobalObjectByTournamentLevel(tournamentLevel).tournaments;
                    for (let i = 0; i < tournament.length; i++) {
                        if (tournament[i].EventId === data.tid) {
                            for (let j = 0; j < tournament[i].Matches.length; j++) {
                                const match = tournament[i].Matches[j];
                                if (match.Id === data.mid) {
                                    match.Id = data.mid;
                                    match.EventId = data.tid;
                                    match.RailPosition = data.rp;
                                    match.LiveListingPosition = data.lp;
                                    match.Status = data.data[0];
                                    match.NumberOfSets = data.nos;
                                    match.MatchTime = data.t;
                                    match.MatchInfo = data.data[1];

                                    match.TeamOne.TeamStatus = data.t1d[1];

                                    match.TeamOne.Scores.CurrentScore = data.t1d[2];
                                    match.TeamOne.Scores.SetOne = data.t1d[3];
                                    match.TeamOne.Scores.SetOneTiebreak = data.t1d[4];
                                    match.TeamOne.Scores.SetTwo = data.t1d[5];
                                    match.TeamOne.Scores.SetTwoTiebreak = data.t1d[6];
                                    match.TeamOne.Scores.SetThree = data.t1d[7];
                                    match.TeamOne.Scores.SetThreeTiebreak = data.t1d[8];
                                    match.TeamOne.Scores.SetFour = data.t1d[9];
                                    match.TeamOne.Scores.SetFourTiebreak = data.t1d[10];
                                    match.TeamOne.Scores.SetFive = data.t1d[11];
                                    match.TeamOne.Scores.SetFiveTiebreak = data.t1d[12];

                                    match.TeamTwo.TeamStatus = data.t2d[1];

                                    match.TeamTwo.Scores.CurrentScore = data.t2d[2];
                                    match.TeamTwo.Scores.SetOne = data.t2d[3];
                                    match.TeamTwo.Scores.SetOneTiebreak = data.t2d[4];
                                    match.TeamTwo.Scores.SetTwo = data.t2d[5];
                                    match.TeamTwo.Scores.SetTwoTiebreak = data.t2d[6];
                                    match.TeamTwo.Scores.SetThree = data.t2d[7];
                                    match.TeamTwo.Scores.SetThreeTiebreak = data.t2d[8];
                                    match.TeamTwo.Scores.SetFour = data.t2d[9];
                                    match.TeamTwo.Scores.SetFourTiebreak = data.t2d[10];
                                    match.TeamTwo.Scores.SetFive = data.t2d[11];
                                    match.TeamTwo.Scores.SetFiveTiebreak = data.t2d[12];

                                    match.HasHawkeyeData = data.hed;
                                    match.SecondScreenLink = data.ssl;
                                    match.IsWatchLive = data.wl;
                                    match.HasStats = data.stats;
                                    match.HasHead2Head = data.h2h;
                                    match.HasChallengerTVWeb = data.chtv;

                                    if (data.tie) {
                                        match.TeamTieResults = data.tie;
                                        match.TeamTieResults.RoundRobinGroupNumber =
                                            data.tie[0].length > 0
                                                ? parseInt(data.tie[0])
                                                : data.tie[0];
                                        match.TeamTieResults.RoundRobinGroupName = data.tie[1];
                                        match.TeamTieResults.RoundRobinCityName = data.tie[2];
                                        match.TeamTieResults.TeamCountryCode = data.tie[3];
                                        match.TeamTieResults.OpponentTeamCountryCode = data.tie[4];
                                        match.TeamTieResults.TeamTieMatchWins =
                                            data.tie[5].length > 0
                                                ? parseInt(data.tie[5])
                                                : data.tie[5];
                                        match.TeamTieResults.OpponentTeamTieMatchWins =
                                            data.tie[6].length > 0
                                                ? parseInt(data.tie[6])
                                                : data.tie[6];
                                        match.TeamTieResults.TotalMatchesPlayed =
                                            data.tie[7].length > 0
                                                ? parseInt(data.tie[7])
                                                : data.tie[7];

                                        var hasTeamTieStats = typeof match.TeamTieResults.TeamCountryCode !== "undefined" &&
                                                              typeof match.TeamTieResults.OpponentTeamCountryCode !== "undefined" &&
                                                              match.TeamTieResults.TeamCountryCode != "" &&
                                                              match.TeamTieResults.OpponentTeamCountryCode != "";

                                        match.TeamTieResults.TeamCountryFlag = data.tie[8];
                                        match.TeamTieResults.OpponentCountryFlag = data.tie[9];
                                        match.TeamTieResults.HasTeamTieStats = hasTeamTieStats;
                                    } else {
                                        match.TeamTieResults.HasTeamTieStats = false;
                                    }
                                }
                            }

                            self.updateCurrentTournamentsScoreData(tournamentLevel);
                        }
                    }
                }
            });
        };
        LiveScoresUpdater.prototype.getCurrentTournamentsScoreDataByMatch = function (tournamentLevel, matchKey) {
            const self = this;
            return self.getCurrentTournamentsScoreData(tournamentLevel).matches[matchKey];
        };
        LiveScoresUpdater.prototype.getCurrentTournamentsScoreData = function (tournamentLevel) {
            if (tournamentLevel.toLowerCase() === "challenger") {
                return window.GLOBAL_SCORES.challengerCurrentTournamentsScoreData;
            }
            if (tournamentLevel.toLowerCase() === "tour") {
                return window.GLOBAL_SCORES.tourCurrentTournamentsScoreData;
            }

            return window.GLOBAL_SCORES.tourCurrentTournamentsScoreData;
        };
        LiveScoresUpdater.prototype.getScoresGlobalObjectByTournamentLevel = function (tournamentLevel)
        {
            if (tournamentLevel.toLowerCase() === "challenger") {
                return window.GLOBAL_SCORES.challengerList;
            }
            if (tournamentLevel.toLowerCase() === "tour") {
                return window.GLOBAL_SCORES.tourList;
            }

            return window.GLOBAL_SCORES.tourList;
        };
        LiveScoresUpdater.prototype.setScoresGlobalObjectByTournamentLevelModule = function (tournamentLevel, getInitialScoresResponseData) {
            if (tournamentLevel.toLowerCase() === "challenger") {
                window.GLOBAL_SCORES.challengerList.tournaments = getInitialScoresResponseData.data.liveScores.Tournaments;
            }

            if (tournamentLevel.toLowerCase() === "tour") {
                window.GLOBAL_SCORES.tourList.tournaments = getInitialScoresResponseData.data.liveScores.Tournaments;
            }
        };
        LiveScoresUpdater.prototype.pollScores = function (tournamentLevel, vmUpdaterCallback) {
            const self = this;
            var apiUrl = tournamentLevel.toLowerCase() === "challenger" ? self.options.initialLoadUrlChallenger : self.options.initialLoadUrl;

            Axios.get(`${window.location.origin}${apiUrl}`).then(function (response) {
                self.setScoresGlobalObjectByTournamentLevelModule(tournamentLevel, response);

                self.signalRScores(tournamentLevel);
                vmUpdaterCallback();
            });
        };
        return LiveScoresUpdater;
    })());
});
