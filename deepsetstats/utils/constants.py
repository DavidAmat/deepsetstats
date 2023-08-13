# from os.path import join
# from pathlib import Path

import numpy as np

# -------------------------
#      Paths
# -------------------------
PATH_VIDS = "/Users/davidamat/Documents/BackUp/DeepSetStats"

# -------------------------
#      RGB Courts
# -------------------------
RGB_CLAY = np.array((183, 115, 84))
RGB_US = np.array((100, 115, 159))
RGB_WBl = np.array((154, 152, 114))
RGB_WBd = np.array((137, 133, 88))
RGB_WBsand = np.array((180, 152, 152))
RGB_AO = np.array((108, 156, 196))
RGB_COURTS = np.vstack((RGB_CLAY, RGB_US, RGB_WBl, RGB_WBd, RGB_AO))
LIST_COURTS = ["CLAY", "GREENSET_US", "GRASS", "GRASS", "GREENSET_AO"]

# -------------------------
#      RGB Lines
# -------------------------
RGB_LINE_WHITE = np.array([255, 255, 255])
RGB_LINE_CLAYc = np.array((234, 177, 153))
RGB_LINE_CLAYd = np.array((189, 130, 107))
RGB_LINE_GREENSET_USc = np.array((231, 233, 238))
RGB_LINE_GREENSET_USd = np.array((193, 202, 224))
RGB_LINE_GRASSc = np.array((244, 232, 226))
RGB_LINE_GRASSd = np.array((170, 168, 134))
RGB_LINE_GREENSET_AOc = np.array((200, 228, 240))
RGB_LINE_GREENSET_AOd = np.array((125, 180, 224))

# -------------------------
#      LAB COLORS
# -------------------------
# Thresholds LAB color difference with the main color
LAB_TH = {"CLAY": 5, "GREENSET_US": 15, "GRASS": 10, "GREENSET_AO": 5}


# -------------------------
#  EXTRA LAB COURT COLORS
# -------------------------
# Wimbledon: grass sand
LAB_EXTRA_COLORS = {"GRASS": np.array([170, 140, 140])}

# -------------------------
#      Line Toleratences
# -------------------------
# GRASS:
#   Dirty serve line: 170, 168, 134
#   Dirty end line: 247, 220, 214
#   Green grass: 150, 150, 120
#   Dark grass: 135, 131, 88


TOL_LINE = {
    "CLAY": np.array([15, 10, 10]),
    "GREENSET_US": np.array([15, 10, 10]),
    "GRASS": np.array([20, 10, 10]),
    "GREENSET_AO": np.array([15, 10, 10]),
}
GRAD_TOL = 15

# -------------------------
#      Gradient Lines
# -------------------------
GRAD_LINE_MAX_WIDTH = 10
TOL_RGB_MIN_DIFF = 25
TOL_RGB_MAX_DIFF = 45
D_GRAD_LINES = {
    "CLAY": {
        "COURT": RGB_CLAY,
        "LINE_CLEAN": RGB_LINE_CLAYc,
        "LINE_DIRTY": RGB_LINE_CLAYd,
    },
    "GREENSET_US": {
        "COURT": RGB_US,
        "LINE_CLEAN": RGB_LINE_GREENSET_USc,
        "LINE_DIRTY": RGB_LINE_GREENSET_USd,
    },
    "GRASS": {
        "COURT": RGB_WBd,
        "LINE_CLEAN": RGB_LINE_GRASSc,
        "LINE_DIRTY": RGB_LINE_GRASSd,
    },
    "GREENSET_AO": {
        "COURT": RGB_AO,
        "LINE_CLEAN": RGB_LINE_GREENSET_AOc,
        "LINE_DIRTY": RGB_LINE_GREENSET_AOd,
    },
}
