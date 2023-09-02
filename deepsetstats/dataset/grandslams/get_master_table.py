import os
import re

import pandas as pd
import tqdm

from deepsetstats.dataset.utils import (
    extract_players_title,
    extract_tournament_title,
    load_pickle,
)

os.system("clear")

# Path dataframe
PATH_US_OPEN_VIDEOS = "deepsetstats/dataset/grandslams/parquet/us_open_videos.parquet"
PATH_AUSTRALIA_OPEN_VIDEOS = "deepsetstats/dataset/grandslams/parquet/australia_open_videos.parquet"
PATH_ROLANDGARROS_VIDEOS = "deepsetstats/dataset/grandslams/parquet/roland_garros_videos.parquet"
PATH_WIMBLEDON_VIDEOS = "deepsetstats/dataset/grandslams/parquet/wimbledon_videos.parquet"
PATH_TOURNAMENTS_NAMING = (
    "deepsetstats/dataset/tournaments/parquet/tournaments_tennistv.parquet"
)

PATH_BIBLE_PLAYERS = "deepsetstats/dataset/players/parquet/bible_players.parquet"
PATH_MAP_ID2NAME = "deepsetstats/dataset/players/pickle/map_id2name.parquet"

# Output Path
PATH_MASTER = "deepsetstats/dataset/grandslams/parquet/master.parquet"

# --------------------------------------- #
# --------------------------------------- #
# Get datasets
# --------------------------------------- #
# --------------------------------------- #
df_tour = pd.read_parquet(PATH_TOURNAMENTS_NAMING, engine="pyarrow")
df_us = pd.read_parquet(PATH_US_OPEN_VIDEOS, engine="pyarrow")
df_rg = pd.read_parquet(PATH_ROLANDGARROS_VIDEOS, engine="pyarrow")
df_ao = pd.read_parquet(PATH_AUSTRALIA_OPEN_VIDEOS, engine="pyarrow")
df_wb = pd.read_parquet(PATH_WIMBLEDON_VIDEOS, engine="pyarrow")
df_players = pd.read_parquet(PATH_BIBLE_PLAYERS, engine="pyarrow")
df_players = df_players[df_players["best_ranking"] < 100].copy()
d1 = load_pickle(PATH_MAP_ID2NAME)


df_us["tournament_name"] = "US Open"
df_rg["tournament_name"] = "Roland Garros"
df_ao["tournament_name"] = "Australian Open"
df_wb["tournament_name"] = "Wimbledon"

# --------------------------------- #
# Players
# --------------------------------- #
player_common_names = df_players["common_name"].tolist()
player_common_names_2 = df_players["common_name_2"].tolist()
player_full_names = df_players["name"].tolist()
player_ids = df_players["player_id"].tolist()

# --------------------------------- #
# Ids of Grand Slams
# --------------------------------- #
d_ids_grandslams = {}
for _, row in df_tour[df_tour["level"] == "grandslam"].iterrows():
    d_ids_grandslams[row["tournament_name"]] = row["tournament_id"]

# --------------------------------- #
# Tennis TV Get Videos of Highlights
# --------------------------------- #
df_all_grands = pd.concat([df_us, df_rg, df_ao, df_wb])
mask1 = df_all_grands.title.str.contains("ighlights")
mask2 = df_all_grands.title.str.contains("Condensed Match")
mask3 = df_all_grands.title.str.contains("Full Match")
dfh = df_all_grands[mask1 | mask2 | mask3]

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
    tour_name = row["tournament_name"]
    tour_id = d_ids_grandslams[tour_name]

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
df_final = pd.merge(df_final, dfh[cols_tt], on="video_id", how="left")


# --------------------------------------- #
# --------------------------------------- #
# Add years
# --------------------------------------- #
# --------------------------------------- #

def get_year(title):

    # Define the regex pattern to match a 4-digit year starting with "19" or "20"
    pattern = r'\b(?:19\d{2}|20\d{2})\b'

    # Search for the year in the title
    match = re.search(pattern, title)

    # Check if a match was found
    if match:
        year = match.group(0)
        return int(year)
    else:
        return None


df_final["year"] = df_final["title"].map(get_year)
df_final["year"] = df_final["year"].fillna(2020).astype(int)
df_final.sort_values("year", ascending=False)


# Writing final dataframe master
df_final.to_parquet(PATH_MASTER, engine="pyarrow")
