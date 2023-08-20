import os

import pandas as pd
import tqdm

from deepsetstats.dataset.utils import (
    extract_players_title,
    extract_tournament_title,
    load_pickle,
)

os.system("clear")

# Path dataframe
PATH_TENNIS_TV_VIDEOS = "deepsetstats/dataset/tennistv/parquet/tennistv_videos.parquet"
PATH_BIBLE_PLAYERS = "deepsetstats/dataset/players/parquet/bible_players.parquet"
PATH_TOURNAMENTS_NAMING = (
    "deepsetstats/dataset/tournaments/parquet/tournaments_tennistv.parquet"
)
PATH_MAP_ID2NAME = "deepsetstats/dataset/players/pickle/map_id2name.parquet"

# Output Path
PATH_MASTER = "deepsetstats/dataset/tennistv/parquet/master.parquet"

# --------------------------------------- #
# --------------------------------------- #
# Get datasets
# --------------------------------------- #
# --------------------------------------- #
df_tennistv = pd.read_parquet(PATH_TENNIS_TV_VIDEOS, engine="pyarrow")
df_tour = pd.read_parquet(PATH_TOURNAMENTS_NAMING, engine="pyarrow")
df_players = pd.read_parquet(PATH_BIBLE_PLAYERS, engine="pyarrow")
df_players = df_players[df_players["best_ranking"] < 100].copy()
d1 = load_pickle(PATH_MAP_ID2NAME)

# --------------------------------- #
# Players
# --------------------------------- #
player_common_names = df_players["common_name"].tolist()
player_common_names_2 = df_players["common_name_2"].tolist()
player_full_names = df_players["name"].tolist()
player_ids = df_players["player_id"].tolist()

# --------------------------------- #
# Tournaments naming in Tennis TV
# --------------------------------- #
tournament_names = df_tour["tournament_name"].tolist()
tournament_ids = df_tour["tournament_id"].tolist()

# --------------------------------- #
# Tennis TV Get Videos of Highlights
# --------------------------------- #
dfh = df_tennistv[df_tennistv.title.str.contains("ighlights")]

# --------------------------------------- #
# --------------------------------------- #
# Create master table
# --------------------------------------- #
# --------------------------------------- #
ept = extract_players_title
ett = extract_tournament_title

d_master = {
    "video_id": [],
    "player_id": [],
    "tournament_id": [],
}
not_found_tourn = []
not_found_players = []

for _, row in tqdm.tqdm(dfh.iterrows()):
    video_id = row["video_id"]
    raw_title = row["title"]

    tour_id, tour_name, raw_title = ett(
        raw_string=raw_title,
        tournament_names=tournament_names,
        tournament_ids=tournament_ids,
    )

    if tour_id is None:
        not_found_tourn.append(video_id)
        continue

    play_ids = ept(
        raw_string=raw_title,
        player_ids=player_ids,
        player_full_names=player_full_names,
        player_common_names=player_common_names,
        player_common_names_2=player_common_names_2,
    )

    if len(play_ids) < 1:
        not_found_players.append(video_id)
        continue

    for pid in play_ids:
        d_master["video_id"].append(video_id)
        d_master["player_id"].append(pid)
        d_master["tournament_id"].append(tour_id)

df_final = pd.DataFrame(d_master)

cols_tour = ["tournament_name", "tournament_id"]
df_final = pd.merge(df_final, df_tour[cols_tour], on="tournament_id", how="left")

cols_players = ["player_id", "name"]
df_final = pd.merge(df_final, df_players[cols_players], on="player_id", how="left")

cols_tt = ["title", "video_id"]
df_final = pd.merge(df_final, df_tennistv[cols_tt], on="video_id", how="left")

# Writing final dataframe master
df_final.to_parquet(PATH_MASTER, engine="pyarrow")
