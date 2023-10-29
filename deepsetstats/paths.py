"""
All paths assume the source directory is the /usr/src/app directory
which is equivalent of the root directory of the repo
"""
from os.path import join as j

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Src
# ------------------------------------------------- #
# ------------------------------------------------- #
PATH_CONFIG = "deepsetstats/src/config/config_{version}.yaml"

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Dataset
# ------------------------------------------------- #
# ------------------------------------------------- #
PATH_VIDEOS_MAIN = "videos"
PATH_IMAGES = "images"
PATH_ANNOT = "annotations"

# Path of videos in the external hard drive
PATH_VIDEOS = j(PATH_VIDEOS_MAIN, "all")
PATH_FRAMES = j(PATH_IMAGES, "all")

# --------------------------------------- #
#      Master of Videos
# --------------------------------------- #
PATH_DATASET_VIDEOS = "deepsetstats/dataset/videos"
PATH_DATASET_VIDEOS_PQ = j(PATH_DATASET_VIDEOS, "parquet")
PATH_MASTER_VIDEOS = j(PATH_DATASET_VIDEOS_PQ, "master_videos.parquet")
PATH_VIDEOS_METADATA = j(PATH_DATASET_VIDEOS_PQ, "metadata_videos.parquet")
PATH_VIDEOS_ERRORED = j(PATH_DATASET_VIDEOS_PQ, "error_videos.parquet")

# --------------------------------------- #
#      Grand Slams
# --------------------------------------- #
# Path of the grandslams data
PATH_DATASET_GS = "deepsetstats/dataset/grandslams"

# Path of grandslams parquets
PATH_PQ_GS = j(PATH_DATASET_GS, "parquet")

# Grand slams paths
PATH_AUSTRALIA_OPEN_VIDEOS = j(PATH_PQ_GS, "australia_open_videos.parquet")
PATH_ROLANDGARROS_VIDEOS = j(PATH_PQ_GS, "roland_garros_videos.parquet")
PATH_US_OPEN_VIDEOS = j(PATH_PQ_GS, "us_open_videos.parquet")
PATH_WIMBLEDON_VIDEOS = j(PATH_PQ_GS, "wimbledon_videos.parquet")

# Path master of Grand Slams videos channels (Wimble, RG, AO, US)
PATH_MASTER_GS = j(PATH_PQ_GS, "master.parquet")

# --------------------------------------- #
#      Tennis TV
# --------------------------------------- #
# Path of the tennis_tv videos
PATH_DATASET_TT = "deepsetstats/dataset/tennistv"

# Path of tennis_tv parquets
PATH_PQ_TT = j(PATH_DATASET_TT, "parquet")

# Path of the titles and video ids from the Tennis TV YouTube channel
PATH_TENNIS_TV_VIDEOS = j(PATH_PQ_TT, "tennistv_videos.parquet")

# Path master of Tennis TV videos
PATH_MASTER_TENNIS_TV = j(PATH_PQ_TT, "master.parquet")

# --------------------------------------- #
#      Tournaments
# --------------------------------------- #
# Path of the tennis_tv videos
PATH_DATASET_TOUR = "deepsetstats/dataset/tournaments"

# Path of tournaments tables official from the ATP website
PATH_PQ_TOUR = j(PATH_DATASET_TOUR, "parquet")

# Paths of HTML of the tournaments of ATP
PATH_HTML_TOUR = j(PATH_DATASET_TOUR, "html")
PATH_TOURNAMENTS_HTML = j(PATH_HTML_TOUR, "tournaments.html")

# Path of tournaments table
PATH_TOURNAMENTS = j(PATH_PQ_TOUR, "tournaments.parquet")

# Print the extracted data
PATH_TOURNAMENTS_NAMING = j(PATH_PQ_TOUR, "tournaments_tennistv.parquet")


# --------------------------------------- #
#      Players
# --------------------------------------- #
PATH_DATASET_PLAYERS = "deepsetstats/dataset/players"

# Path of players special formats
PATH_PQ_PLAYERS = j(PATH_DATASET_PLAYERS, "parquet")
PATH_PK_FLAGS = j(PATH_DATASET_PLAYERS, "flags")
PATH_PK_PICKLE = j(PATH_DATASET_PLAYERS, "pickle")
PATH_HTML_ATP = j(PATH_DATASET_PLAYERS, "html")

# Paths of the downloaded html pages of some years intervaled rankings ATP
PATHS_HTML_RANKINGS = [
    j(PATH_HTML_ATP, "rankRange=1-1000&rankDate=2023-07-31.html"),
    j(PATH_HTML_ATP, "rankRange=1-1000&rankDate=2021-08-09.html"),
    j(PATH_HTML_ATP, "rankRange=1-1000&rankDate=2015-10-05.html"),
    j(PATH_HTML_ATP, "rankRange=1-1000&rankDate=2009-05-11.html"),
    j(PATH_HTML_ATP, "rankRange=1-1000&rankDate=2003-09-29.html"),
    j(PATH_HTML_ATP, "rankRange=1-5000&rankDate=1998-09-28.html"),
    j(PATH_HTML_ATP, "rankRange=1-5000&rankDate=1990-12-17.html"),
    j(PATH_HTML_ATP, "rankRange=1-5000&rankDate=1985-12-09.html"),
]

# Tables
PATH_PLAYERS_RANK = j(PATH_PQ_PLAYERS, "players.parquet")
PATH_BIBLE_PLAYERS = j(PATH_PQ_PLAYERS, "bible_players.parquet")

# Flags
PATH_FLAGS_COUNTRIES = j(PATH_PK_FLAGS, "flags.pickle")

# Maps
PATH_MAP_ID2NAME = j(PATH_PK_PICKLE, "map_id2name.pickle")
PATH_MAP_NAME2ID = j(PATH_PK_PICKLE, "map_name2id.pickle")
PATH_MAP_CNAME2ID = j(PATH_PK_PICKLE, "map_cname2id.pickle")
PATH_MAPID2COUNTRY = j(PATH_PK_PICKLE, "map_id2country.pickle")

# --------------------------------------- #
#      Court Detection
# --------------------------------------- #
PATH_DATASET_IMAGES = "images"
PATH_IMAGES_REFCOURT = j(PATH_DATASET_IMAGES, "ref_court")

# ....................... #
#    Reference videos
# ....................... #
# Path reference videos is unique for Tennist TV and GS
PATH_REFERENCE_VIDEOS = j(PATH_PQ_TT, "reference_videos.parquet")

# Annotations
PATH_ANNOT_REF = j(PATH_ANNOT, "reference_courts")
PATH_ANNOTATIONS_REFERENCE = j(PATH_ANNOT_REF, "annotations.xml")
PATH_ANNOTATIONS_REFERENCE_PARQUET = j(PATH_ANNOT_REF, "annotations.parquet")


# --------------------------------------- #
#      Images
# --------------------------------------- #
PATH_DATASET_TMP_MATCH = "deepsetstats/dataset/template_matching"
PATH_TMP_MATCH_PQ = j(PATH_DATASET_TMP_MATCH, "parquet")

# ....................... #
#    Template Matching
# ....................... #
# Temporal directory for the parallelized partitioned template matching results
PATH_TEMPLATE_MATCHING = j(PATH_TMP_MATCH_PQ, "template_matching")

# The previous parallelized partiioned parquet will be converted into a single parquet
# the previous one will be removed, so this will be the final used
PATH_TEMPLATE_MATCHING_SINGLE_PQ = j(PATH_TMP_MATCH_PQ, "template_matching.parquet")

# ....................... #
#    Intervals
# ....................... #
PATH_INTERVALS = j(PATH_TMP_MATCH_PQ, "intervals.parquet")
PATH_INTERVALS_NOT_COURT = j(PATH_TMP_MATCH_PQ, "intervals_notcourt.parquet")

# --------------------------------------- #
#      Dataset Courts
# --------------------------------------- #
PATH_FOLDER_DATASET_COURT = "deepsetstats/dataset/dataset_court"
PATH_PQ_COURT = j(PATH_FOLDER_DATASET_COURT, "parquet")
PATH_DATASET_COURT = j(PATH_PQ_COURT, "dataset_court.parquet")
PATH_IMAGES_DATASET_COURT = j(PATH_IMAGES, "all/dataset_court")
