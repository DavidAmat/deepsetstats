import re
from datetime import datetime

import pandas as pd
from bs4 import BeautifulSoup

format = """
    {
        "tournament_level": ["1000", "250", "grandslam"],
        "location_city": ["Barcelon", "Perth", "Paris"],
        "location_country": ["Spain", "Australia", "France"],
        "court_type": ["Outdoor Hard", "Clay" "Outdoor Grass"],
        "tournament_month": ["June", "August", "September"],
        "tournament_name": ["Open Banc Sabadell", "Australia Perth Open", "Roland Garros"]
    }
"""

results = {
    "level": [],
    "city": [],
    "country": [],
    "court_type": [],
    "month": [],
    "name": [],
    "date_start": [],
    "date_end": [],
}

TOURNAMENT_LEVELS = {"250", "500", "1000", "grandslam"}

# Read the HTML file
PATH_HTML = "deepsetstats/dataset/tournaments/html/tournaments.html"
with open(PATH_HTML, "r", encoding="utf-8") as file:
    html_content = file.read()

# Parse the HTML content using Beautiful Soup
soup = BeautifulSoup(html_content, "html.parser")

# Initialize the data structure to store the extracted information
tournaments_data = {}

# Find all accordion panels
accordion_panels = soup.find_all(class_="content-accordion expand")

# Loop through each accordion panel
for panel in accordion_panels:
    # Extract the tournament month
    month = panel.find(class_="accordion-label").text.strip()  # December 2022

    # Find all tournament results within the panel
    tournament_results = panel.find_all(class_="tourney-result")

    # Initialize the data structure for the current month
    month_data = {}

    # Loop through each tournament result
    for result in tournament_results:
        # ---------------------- #
        # ATP Tournament Level
        # ---------------------- #
        img_tag = result.find("img")
        src_img = img_tag.get(
            "src"
        )  # './tournaments_files/categorystamps_grandslam.png'
        if src_img.endswith(".png"):
            match = re.search(r"categorystamps_(.+)\.png", src_img)
        elif src_img.endswith(".svg"):
            # Nitto ATP Finals have a svg
            match = re.search(r"categorystamps_(.+)\.svg", src_img)
        if match:
            tournament_level = str(match.group(1))
        else:
            tournament_level = ""

        results["level"].append(tournament_level)

        # ---------------------- #
        # Tournament Name
        # ---------------------- #
        tournament_name = result.find(class_="tourney-title").text.strip()
        results["name"].append(tournament_name)

        # ---------------------- #
        # Tournament Location
        # ---------------------- #
        tournament_location = result.find(class_="tourney-location").text.strip()
        match = re.match(r"^(.+),\s*(.+)$", tournament_location)
        if match:
            city_name = match.group(1)
            country = match.group(2)
        else:
            city_name = ""
            country = ""
        results["city"].append(city_name)
        results["country"].append(country)

        # ---------------------- #
        # Tournament Dates
        # ---------------------- #
        tournament_dates = result.find(
            class_="tourney-dates"
        ).text.strip()  # '2022.12.29 - 2023.01.08'
        # Extract initial and final dates using regular expression
        match = re.match(
            r"(\d{4}\.\d{2}\.\d{2}) - (\d{4}\.\d{2}\.\d{2})", tournament_dates
        )

        if match:
            initial_date_str = match.group(1)
            final_date_str = match.group(2)

            # Convert strings to datetime objects
            initial_date = datetime.strptime(initial_date_str, "%Y.%m.%d")
            final_date = datetime.strptime(final_date_str, "%Y.%m.%d")
            month = initial_date.strftime("%b")  # Dec, Jan, Feb, ...
        else:
            month = ""
            initial_date = ""
            final_date = ""

        results["date_start"].append(initial_date)
        results["date_end"].append(final_date)
        results["month"].append(month)

        # ---------------------- #
        # Tournament Court Type
        # ---------------------- #
        details = result.find_all(class_="tourney-details-table-wrapper")[0]
        tourney_details = details.find_all(class_="tourney-details")
        court_type_detail = tourney_details[1]
        court_type = court_type_detail.find(class_="item-details").text.strip()
        # Remove spaces and carriage returns using regular expression
        court_type = re.sub(r"\s+", " ", court_type)
        results["court_type"].append(court_type)

# Print the extracted data
PATH_TOURNAMENTS = "deepsetstats/dataset/tournaments/parquet/tournaments.parquet"
df = pd.DataFrame(data=results)
df.to_parquet(PATH_TOURNAMENTS, engine="pyarrow")
print(df)
