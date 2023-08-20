import json
import pickle
import re
import string
from copy import copy
from typing import Dict

import numpy as np
import regex


def master_prettify(input_json: Dict):
    final_prettified_json = json.dumps(input_json, indent=4)
    return final_prettified_json


def write_pickle(path, di):
    with open(path, "wb") as file:
        # Load the dictionary from the pickle file
        pickle.dump(di, file)


def load_pickle(path):
    with open(path, "rb") as file:
        # Load the dictionary from the pickle file
        data = pickle.load(file)
    return data


# Define the translation table
exclude_punctuation = string.punctuation
translator = str.maketrans(exclude_punctuation, " " * len(exclude_punctuation))


def extract_tournament_title(raw_string, tournament_names, tournament_ids):
    query_string = raw_string.translate(translator)

    # Replace consecutive spaces with single spaces
    query_string = re.sub(r"\s+", " ", query_string)

    final_tournament_id = None
    final_tournament_name = None

    for tournament_name, tournament_id in zip(tournament_names, tournament_ids):
        # Remove punctuation and replace with spaces
        tournament_name = tournament_name.translate(translator)
        permitted_errors = 1
        match_tournament_name = regex.search(
            rf"(\s)({tournament_name})(\s){{e<={permitted_errors}}}", query_string
        )
        # If full name is there
        if match_tournament_name:
            # Gotta remove the matched tournament name from the query string to avoid
            # a player matching that name (i.e Washington is also the surname of a player...)
            start, end = match_tournament_name.span()
            query_string = query_string[:start] + " " + query_string[end:]
            final_tournament_id = tournament_id
            final_tournament_name = tournament_name
            return final_tournament_id, final_tournament_name, query_string
    return final_tournament_id, final_tournament_name, query_string


def extract_players_title(
    raw_string,
    player_ids,
    player_full_names,
    player_common_names,
    player_common_names_2,
):
    # ------------------------------------------------ #
    #   Input string cleansing
    # ------------------------------------------------ #
    # Remove punctuation and replace with spaces
    query_string = raw_string.translate(translator)

    # Replace consecutive spaces with single spaces
    query_string = re.sub(r"\s+", " ", query_string)

    # ------------------------------------------------ #
    #   Player ids, full name and common name loop
    # ------------------------------------------------ #
    player_ids_candidates_in_query = []
    fullname_candidates_in_query = []
    common_name_candidates_in_query = []

    iter_string = copy(query_string)
    for full_name, common_name, common_name2, player_id in zip(
        player_full_names, player_common_names, player_common_names_2, player_ids
    ):
        # Remove punctuation and replace with spaces
        full_name = full_name.translate(translator)
        common_name = common_name.translate(translator)
        common_name2 = common_name2.translate(translator)

        # Short common names would have more strict match requirements
        # to avoid players like He matching a dummy string in the title
        min_len = np.min([len(common_name), len(common_name2)])
        permitted_errors = 0 if min_len < 5 else 1

        # Quick check if the surname (common name) it's there
        match_common_1 = regex.search(
            rf"(\s|^)({common_name})(\s){{e<={permitted_errors}}}", query_string
        )
        match_common_2 = regex.search(
            rf"(\s|^)({common_name2})(\s){{e<={permitted_errors}}}", query_string
        )

        if match_common_1 or match_common_2:
            cname = common_name if match_common_1 else common_name2

            player_ids_candidates_in_query.append(player_id)
            fullname_candidates_in_query.append(full_name)
            common_name_candidates_in_query.append(cname)

    player_ids_in_query = []
    iter_player_ids_candidates_in_query = copy(player_ids_candidates_in_query)
    iter_common_name_candidates_in_query = copy(common_name_candidates_in_query)

    for full_name, common_name, player_id in zip(
        fullname_candidates_in_query,
        common_name_candidates_in_query,
        player_ids_candidates_in_query,
    ):

        # Remove punctuation and replace with spaces
        full_name = full_name.translate(translator)
        common_name = common_name.translate(translator)

        # Check if the full name is there
        full_name_match = regex.search(rf"({full_name}){{e<=1}}", iter_string)

        # If full name is there
        if full_name_match:
            start, end = full_name_match.span()
            iter_string = iter_string[:start] + " " + iter_string[end:]

            # Add candidate as the final match of player found in video title
            player_ids_in_query.append(player_id)

            # Remove candidate
            iter_player_ids_candidates_in_query.remove(player_id)
            iter_common_name_candidates_in_query.remove(common_name)
            continue

    # For the rest, get the best common name match
    for common_name, player_id in zip(
        iter_common_name_candidates_in_query, iter_player_ids_candidates_in_query
    ):
        # Remove punctuation and replace with spaces
        common_name = common_name.translate(translator)

        # Check that the entire common name is surrounded by spaces or commas
        cname_name_match = regex.search(
            rf"(^|\s)({common_name})($|\s){{e<=1}}", iter_string
        )

        # If full name is there
        if cname_name_match:
            start, end = cname_name_match.span()
            iter_string = iter_string[:start] + " " + iter_string[end:]

            # Add candidate as the final match of player found in video title
            player_ids_in_query.append(player_id)

            # Remove candidate
            player_ids_candidates_in_query.remove(player_id)
    return player_ids_in_query
