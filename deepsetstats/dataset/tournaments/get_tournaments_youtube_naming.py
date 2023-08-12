import pandas as pd

from deepsetstats.dataset.tournaments.constants import TOURNAMENT_NAMING

PATH_TOURNAMENTS = "deepsetstats/dataset/tournaments/parquet/tournaments.parquet"

df = pd.read_parquet(PATH_TOURNAMENTS, engine="pyarrow")

# Grand slams
grandslam = df.query("level in ('grandslam')").copy()
grandslam["yt_name"] = grandslam["city"].map(TOURNAMENT_NAMING["GRANDSLAM"])

# Masters 1000
tour_1000 = df.query("level in ('1000')").copy()
tour_1000["yt_name"] = tour_1000["city"].map(TOURNAMENT_NAMING["1000"])


# Masters 500
tour_500 = df.query("level in ('500')").copy()
tour_500["yt_name"] = tour_500["city"].map(TOURNAMENT_NAMING["500"])


# Print the extracted data
PATH_TOURNAMENTS_NAMING = (
    "deepsetstats/dataset/tournaments/parquet/tournaments_youtube.parquet"
)
df_all = pd.concat([grandslam, tour_1000, tour_500])
df_all.to_parquet(PATH_TOURNAMENTS_NAMING, engine="pyarrow")
