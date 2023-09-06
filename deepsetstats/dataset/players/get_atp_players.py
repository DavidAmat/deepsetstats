import os
import pickle

import numpy as np
import pandas as pd
from bs4 import BeautifulSoup

from deepsetstats.dataset.players.utils import (
    calculate_date_of_birth,
    create_link_flag_image,
    extract_date,
)
from deepsetstats.dataset.utils import write_pickle
from deepsetstats.paths import (
    PATH_BIBLE_PLAYERS,
    PATH_FLAGS_COUNTRIES,
    PATH_MAP_CNAME2ID,
    PATH_MAP_ID2NAME,
    PATH_MAP_NAME2ID,
    PATH_MAPID2COUNTRY,
    PATH_PLAYERS_RANK,
    PATH_PQ_PLAYERS,
    PATHS_HTML_RANKINGS,
)

os.system("clear")

results_flag = {
    "country": [],
    "flag_url": [],
}
results = {}


# ------------------------------------------------- #
# ------------------------------------------------- #
#      Iterate on Ranking ATP Pages
# ------------------------------------------------- #
# ------------------------------------------------- #
# Each ranking page has a different date range
for it_rank, rank_file in enumerate(PATHS_HTML_RANKINGS):
    print("It rank:", it_rank)
    results_rank = {"name": [], "year_birth": [], "country": [], "ranking": []}

    # Extract the year of the rank page
    date_rank = extract_date(rank_file)

    # --------------------------------------- #
    #   Parse HTML of Ranking
    # --------------------------------------- #
    with open(rank_file, "r", encoding="utf-8") as file:
        html_content = file.read()

    # Parse the HTML using Beautiful Soup
    soup = BeautifulSoup(html_content, "html.parser")

    # Find the table with class "mega-table"
    table = soup.find("table", class_="mega-table")

    # Find the tbody inside the table
    tbody = table.find("tbody")

    # Find all tr elements within the tbody
    tr_elements = tbody.find_all("tr")

    # **************************************** #
    #   Iterate on each player (row of table)
    # **************************************** #

    # Each table row (tr) it's a player ranking
    for it_player, tr in enumerate(tr_elements):

        if (it_player % 100) == 0:
            print("It player:", it_player)

        # PLayer Name
        player_cell_wrapper = tr.find("span", class_="player-cell-wrapper")
        player_name = player_cell_wrapper.text.strip()

        # Player Age
        age_cell = tr.find("td", class_="age-cell")
        try:
            age = int(age_cell.text.strip())
        except Exception:
            # There is a player with missing age
            age_str = "25"
            age = int(age_str)
        date_of_birth = calculate_date_of_birth(date_rank, age)

        # Country
        img = tr.find("img")
        country = img["alt"].upper()

        # Persist data
        results_rank["name"].append(player_name)
        results_rank["year_birth"].append(date_of_birth)
        results_rank["country"].append(country)
        results_rank["ranking"].append(it_player + 1)

        if country not in results_flag:
            flag_url = create_link_flag_image(country)
            results_flag[country] = flag_url

    # **************************************** #
    #    Persists ranking of that year
    # **************************************** #
    print("Finished Rank", date_rank)
    results[date_rank] = results_rank
    PATH_PLAYERS_RANK_DATE = (
        f"{PATH_PQ_PLAYERS}/players_{date_rank}.parquet"
    )
    df_rank_date = pd.DataFrame(data=results_rank)
    df_rank_date.to_parquet(PATH_PLAYERS_RANK_DATE, engine="pyarrow")
    print("Saved df:", PATH_PLAYERS_RANK_DATE)


# ------------------------------------------------- #
# ------------------------------------------------- #
#      Persist Rankings of ALL years together
# ------------------------------------------------- #
# ------------------------------------------------- #

# --------------------------------------- #
#      Players Table of rankings
# --------------------------------------- #
# Saving final
print("Saving final")

# Persist rankings
df_final = pd.DataFrame()
for dt_rank in results:
    df_dt_rank = pd.DataFrame(results[dt_rank])
    df_dt_rank["date_rank"] = dt_rank
    df_final = pd.concat([df_final, df_dt_rank])
df_final.to_parquet(PATH_PLAYERS_RANK, engine="pyarrow")


# --------------------------------------- #
#      Persisting Flags results
# --------------------------------------- #
print("Dumping flags into pickle:", PATH_FLAGS_COUNTRIES)

# Open the pickle file in binary read mode
with open(PATH_FLAGS_COUNTRIES, "wb") as file:
    # Load the dictionary from the pickle file
    pickle.dump(results_flag, file)

# --------------------------------------- #
#   Create the best ranking for each player
# --------------------------------------- #
# Best ranking is a way to incorporate players that in previous rankings
# where top players, but the current ranking they don't appear (i.e Federer)
# This way the database of players will be totally updated with them, even if they are
# historical players that used to be top 50 in these days

df = pd.read_parquet(PATH_PLAYERS_RANK, engine="pyarrow")
unique_players = df[["name", "country"]].drop_duplicates()

# Include best ranking
max_rankings = df.groupby("name")["ranking"].min().reset_index()
max_rankings.rename(columns={"ranking": "best_ranking"}, inplace=True)

# Get unique players with the best ranking
unique_players = pd.merge(unique_players, max_rankings, on="name", how="left")
unique_players["best_ranking"] = (
    unique_players["best_ranking"].fillna(99999).astype(int)
)

# --------------------------------------- #
#   Resolve multiple players countries
# --------------------------------------- #
# Count players by country. If a player has multiple occurrences,
# we will put the name of the country at the end
# There are very few cases, but two players may have the same name
# but be from different nationalities
all_players_count_countries = (
    unique_players.groupby("name")["country"].count().reset_index()
)
mask_repeated_players = all_players_count_countries["country"] > 1
repeated_players = all_players_count_countries[mask_repeated_players].copy()
unique_players_rep = pd.merge(
    unique_players,
    repeated_players.rename(columns={"country": "repeated_name"}),
    on="name",
    how="left",
)

# --------------------------------------- #
#   Create name columns we will look for
# --------------------------------------- #
# When inspecting a YouTube video title, we will look for a match
# of the entire name, but if the entire name does not appear but the surname does
# we want to have the "common_name" (i.e surname) in a column to look for it too
# Since names are complex, we don't know how to split surname and name for composed names
# like Juan Carlos Ferrero. We create two columns, one that splits "Juan - Carlos Ferrero "
# and another that splits it into "Juan Carlos - Ferrero".

dfp = pd.merge(df, unique_players_rep, on=["name", "country"], how="left")
dfp["final_name"] = np.where(
    dfp["repeated_name"] > 1, dfp["name"] + " " + dfp["country"], dfp["name"]
)
# Get name and surname
dfp[["first_name", "common_name"]] = dfp["name"].str.split(n=1, expand=True)
dfp[["first_name_2", "common_name_2"]] = dfp["name"].str.rsplit(n=1, expand=True)

# --------------------------------------- #
#   Remove duplicates
# --------------------------------------- #
# Get away of the duplicates of multiple rankings
cols = [
    "name",
    "country",
    "best_ranking",
    "final_name",
    "first_name",
    "common_name",
    "common_name_2",
]
dfpf = dfp[cols].drop_duplicates()
dfpf.drop("name", axis=1, inplace=True)
dfpf.rename(columns={"final_name": "name"}, inplace=True)

# --------------------------------------- #
#   Create player_id
# --------------------------------------- #
dfpf["player_id"] = dfpf.index

d_id_name = {}  # player-id 2 name
d_name_id = {}
d_common_name_to_id = {}
d_id_country = {}  # unique name 2 common name

for _, row in dfpf.iterrows():
    player_id = row["player_id"]
    player_name = row["name"]
    country = row["country"]
    common_name = row["common_name"]
    common_name2 = row["common_name_2"]

    d_id_name[player_id] = player_name
    if common_name not in d_common_name_to_id:
        d_common_name_to_id[common_name] = player_id
    if common_name2 not in d_common_name_to_id:
        d_common_name_to_id[common_name2] = player_id
    d_name_id[player_name] = player_id

# --------------------------------------- #
#   Persist table
# --------------------------------------- #
# TODO: put True to enable saving
if False:
    write_pickle(PATH_MAP_ID2NAME, d_id_name)
    write_pickle(PATH_MAP_NAME2ID, d_name_id)
    write_pickle(PATH_MAP_CNAME2ID, d_common_name_to_id)
    write_pickle(PATH_MAPID2COUNTRY, d_id_country)
    dfpf.to_parquet(PATH_BIBLE_PLAYERS, engine="pyarrow")

# d1 = load_pickle(PATH_MAP_ID2NAME)
# d2 = load_pickle(PATH_MAP_NAME2ID)
# d3 = load_pickle(PATH_MAP_CNAME2ID)
# d4 = load_pickle(PATH_MAPID2COUNTRY)
