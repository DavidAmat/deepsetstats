"""
This script basically converts the tournaments naming from the official ATP website
to the tournaments namings that appear in the YouTube video titles of the Tennis TV captions.
This is why we need to create a new column named "tournament_name" in order to match
exactly to the name that Tennis TV puts in its videos in YouTube.
"""

import pandas as pd

from deepsetstats.dataset.tournaments.constants import TOURNAMENT_NAMING
from deepsetstats.paths import PATH_TOURNAMENTS, PATH_TOURNAMENTS_NAMING

# --------------------------------------- #
#     Load Tournament namings from ATP
# --------------------------------------- #
# Load tournaments tables
df = pd.read_parquet(PATH_TOURNAMENTS, engine="pyarrow")


# ------------------------------------------------------------- #
#    Map tournament name to Tennis TV common used name
# ------------------------------------------------------------- #
# Grand slams
grandslam = df.query("level in ('grandslam')").copy()
grandslam["tournament_name"] = grandslam["city"].map(TOURNAMENT_NAMING["GRANDSLAM"])

# Masters 1000
tour_1000 = df.query("level in ('1000')").copy()
tour_1000["tournament_name"] = tour_1000["city"].map(TOURNAMENT_NAMING["1000"])


# Masters 500
tour_500 = df.query("level in ('500')").copy()
tour_500["tournament_name"] = tour_500["city"].map(TOURNAMENT_NAMING["500"])

# Masters 250
tour_250 = df.query("level in ('250')").copy()
tour_250["tournament_name"] = tour_250["city"].map(TOURNAMENT_NAMING["250"])

# ATP Finals
tour_finals = df.query("level in ('finals')").copy()
tour_finals["tournament_name"] = tour_finals["city"].map(
    TOURNAMENT_NAMING["ATP_FINALS"]
)

# --------------------------------------- #
#      Persist Tournament namings
# --------------------------------------- #
df_all = pd.concat([grandslam, tour_1000, tour_500, tour_250, tour_finals])
df_all["tournament_id"] = range(len(df_all))
df_all.reset_index(drop=True, inplace=True)
df_all.to_parquet(PATH_TOURNAMENTS_NAMING, engine="pyarrow")
