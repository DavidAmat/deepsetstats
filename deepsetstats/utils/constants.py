# from os.path import join
# from pathlib import Path
import numpy as np

# -------------------------
#      Paths
# -------------------------
PATH_VIDS = "/tmp/youtube"

# -------------------------
#      RGB Courts
# -------------------------
RGB_CLAY = np.array((183, 115, 84))
RGB_US = np.array((100, 115, 159))
RGB_WBl = np.array((154, 152, 114))
RGB_WBd = np.array((137, 133, 88))
RGB_AO = np.array((108, 156, 196))
RGB_COURTS = np.vstack((RGB_CLAY, RGB_US, RGB_WBl, RGB_WBd, RGB_AO))
LIST_COURTS = ["CLAY", "GREENSET_US", "GRASS", "GRASS", "GREENSET_AO"]

# -------------------------
#      RGB Lines
# -------------------------
TOL_LINE = np.array([15, 10, 10])
RGB_LINE_CLAYc = np.array((234, 177, 153))
RGB_LINE_CLAYd = np.array((204, 140, 112))
RGB_LINE_GREENSET_US = np.array((231, 233, 238))
RGB_LINE_GRASSc = np.array((244, 232, 226))
RGB_LINE_GRASSd = np.array((228, 199, 196))
RGB_LINE_GREENSET_AO = np.array((200, 228, 240))

# -------------------------
#      Gradient Lines
# -------------------------
D_GRAD_LINES = {
    "CLAY": {"COURT": RGB_CLAY, "LINE_CLEAN": RGB_LINE_CLAYc, "LINE_DIRTY": RGB_LINE_CLAYd},
    "GREENSET_US": {
        "COURT": RGB_US,
        "LINE_CLEAN": RGB_LINE_GREENSET_US,
        "LINE_DIRTY": RGB_LINE_GREENSET_US,
    },
    "GRASS": {"COURT": RGB_WBd, "LINE_CLEAN": RGB_LINE_GRASSc, "LINE_DIRTY": RGB_LINE_GRASSd},
    "GREENSET_AO": {
        "COURT": RGB_AO,
        "LINE_CLEAN": RGB_LINE_GREENSET_AO,
        "LINE_DIRTY": RGB_LINE_GREENSET_AO,
    },
}
