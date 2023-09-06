"""
This script assumes several steps have been executed so far and generated the following data:
- Reference Videos Notebook in notebooks/datasets/06-reference-videos.ipynb
    This notebook creates the refence videos. It is an interactive script, which selects
    one video per tournament, and selects random frames of the court, so that you manually
    have to give OK to that frame (if the court is clearly seen with all courners without occlusions)
    and the image is saved in the path of the reference court images
"""

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Read Annotations
# ------------------------------------------------- #
# ------------------------------------------------- #
