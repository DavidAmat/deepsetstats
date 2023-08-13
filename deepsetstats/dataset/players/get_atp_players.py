import os
import re

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
