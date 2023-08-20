import os
import pickle
import re

import numpy as np
import pandas as pd
from bs4 import BeautifulSoup

os.system("clear")


def extract_date(url):
    """Extracts the date from the URL."""
    match = re.search(r"\d{4}-\d{2}-\d{2}", url)
    if match:
        return match.group(0)
    else:
        return None


def calculate_date_of_birth(date, age):
    """Calculates the date of birth given the date and age."""
    year = int(date[:4])
    date_of_birth = str(year - age)
    return date_of_birth


def create_link_flag_image(country_code):
    """Creates a link to the ATP Tour flag image."""
    link = (
        "https://www.atptour.com/en/~/media/images/flags/"
        + country_code.lower()
        + ".svg"
    )
    return link


players_ranks = [
    "deepsetstats/dataset/players/html/rankRange=1-1000&rankDate=2023-07-31.html",
    "deepsetstats/dataset/players/html/rankRange=1-1000&rankDate=2021-08-09.html",
    "deepsetstats/dataset/players/html/rankRange=1-1000&rankDate=2015-10-05.html",
    "deepsetstats/dataset/players/html/rankRange=1-1000&rankDate=2009-05-11.html",
    "deepsetstats/dataset/players/html/rankRange=1-1000&rankDate=2003-09-29.html",
    "deepsetstats/dataset/players/html/rankRange=1-5000&rankDate=1998-09-28.html",
    "deepsetstats/dataset/players/html/rankRange=1-5000&rankDate=1990-12-17.html",
    "deepsetstats/dataset/players/html/rankRange=1-5000&rankDate=1985-12-09.html",
]

results_flag = {
    "country": [],
    "flag_url": [],
}

results = {}


# --------------------------------------- #
# --------------------------------------- #
# Iterating on Ranking pages
# --------------------------------------- #
# --------------------------------------- #
# Each ranking page has a different date range
for it_rank, rank_file in enumerate(players_ranks):
    print("It rank:", it_rank)
    results_rank = {"name": [], "year_birth": [], "country": [], "ranking": []}

    # Extract the year of the rank page
    # 2023
    date_rank = extract_date(rank_file)

    # Read the local html of that ranking
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

    print("Finished Rank", date_rank)
    results[date_rank] = results_rank
    PATH_PLAYERS_RANK_DATE = (
        f"deepsetstats/dataset/players/parquet/players_{date_rank}.parquet"
    )
    df_rank_date = pd.DataFrame(data=results_rank)
    df_rank_date.to_parquet(PATH_PLAYERS_RANK_DATE, engine="pyarrow")
    print("Saved df:", PATH_PLAYERS_RANK_DATE)

# Saving final
print("Saving final")
PATH_PLAYERS_RANK = "deepsetstats/dataset/players/parquet/players.parquet"
df_final = pd.DataFrame()
for dt_rank in results:
    df_dt_rank = pd.DataFrame(results[dt_rank])
    df_dt_rank["date_rank"] = dt_rank
    df_final = pd.concat([df_final, df_dt_rank])
df_final.to_parquet(PATH_PLAYERS_RANK, engine="pyarrow")


# Saving final results flag
PATH_FLAGS_COUNTRIES = "deepsetstats/dataset/players/flags/flags.pickle"
# Open the pickle file in binary read mode
with open(PATH_FLAGS_COUNTRIES, "wb") as file:
    # Load the dictionary from the pickle file
    pickle.dump(results_flag, file)

print("Dumped flags into pickle:", PATH_FLAGS_COUNTRIES)

# -------------------------------------------- #
# -------------------------------------------- #
#   Final setting of the player dataset
# -------------------------------------------- #
# -------------------------------------------- #
PATH_PLAYERS_RANK = (
    "deepsetstats/dataset/players/parquet/players.parquet"  # TODO: remove
)
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

# Count players by country. If a player has multiple occurrences, we will put the name of the country at the end
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
dfp = pd.merge(df, unique_players_rep, on=["name", "country"], how="left")
dfp["final_name"] = np.where(
    dfp["repeated_name"] > 1, dfp["name"] + " " + dfp["country"], dfp["name"]
)
# Get name and surname
dfp[["first_name", "common_name"]] = dfp["name"].str.split(n=1, expand=True)
dfp[["first_name_2", "common_name_2"]] = dfp["name"].str.rsplit(n=1, expand=True)
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


PATH_BIBLE_PLAYERS = "deepsetstats/dataset/players/parquet/bible_players.parquet"
PATH_MAP_ID2NAME = "deepsetstats/dataset/players/pickle/map_id2name.parquet"
PATH_MAP_NAME2ID = "deepsetstats/dataset/players/parquet/map_name2id.parquet"
PATH_MAP_CNAME2ID = "deepsetstats/dataset/players/parquet/map_cname2id.parquet"
PATH_MAPID2COUNTRY = "deepsetstats/dataset/players/parquet/map_id2country.parquet"


def write_pickle(path, di):
    with open(path, "wb") as file:
        # Load the dictionary from the pickle file
        pickle.dump(di, file)


def load_pickle(path):
    with open(path, "rb") as file:
        # Load the dictionary from the pickle file
        data = pickle.load(file)
    return data


write_pickle(PATH_MAP_ID2NAME, d_id_name)
write_pickle(PATH_MAP_NAME2ID, d_name_id)
write_pickle(PATH_MAP_CNAME2ID, d_common_name_to_id)
write_pickle(PATH_MAPID2COUNTRY, d_id_country)
dfpf.to_parquet(PATH_BIBLE_PLAYERS, engine="pyarrow")

# d1 = load_pickle(PATH_MAP_ID2NAME)
# d2 = load_pickle(PATH_MAP_NAME2ID)
# d3 = load_pickle(PATH_MAP_CNAME2ID)
# d4 = load_pickle(PATH_MAPID2COUNTRY)
