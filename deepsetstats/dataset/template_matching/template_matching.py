"""
This script aims to compare for each downloaded video, take one query frame every N frames,
check the tournament reference court frame, comparte the query frame to the reference frame
Given two frames (Ref & Query) we will:
    - Patch 4 different rectangles in the image (have 4 sub-images from both Ref and Query)
    - Patching of the rectangles is done with the fractions from the height and width each rectangle will have as dimensions
    - The region patched in Ref and Query is the same array location, so we can compare
    how similar both patches are in that specific region of the image.
    - To do so, we will extract the color histogram with cv2 of both patches of Ref and Query
    - Using the Bhattacharyya coefficient (BC) we will compare how similar these histograms are
    - We will set 2 different thresholds for BC to declare that the patches look VERY similar or just SIMILAR
    - For a patch we will have two evaluations (+2 if very similar, +1 if just similar)
    - Hence, for each of the patches we will have at must a confidence of +8, meaning both Query and Ref
    match very similar to color histograms in all the 4 patches
    - If the image has a confidence of 0 it means that none of the patches in Query matched whatsoever the color histogram of the Ref frame
    - A final threshold of confidence will be selected to consider a Query frame as being similar to the Ref frame
For each video we will save at every N frames the confidence of that Query frame vs. the Ref frame

Execute me
------------
python deepsetstats/dataset/frames/template_matching.py --tournament_id 4
"""
import pandas as pd
from deepsetstats.paths import (
    PATH_MASTER_VIDEOS,
    PATH_VIDEOS_METADATA,
    PATH_ANNOTATIONS_REFERENCE_PARQUET,
    PATH_TEMPLATE_MATCHING
)
from deepsetstats.dataset.court_detection.utils import Utils
from deepsetstats.dataset.court_detection.constants import (
    fs,
    BATCH_SIZE_TEMPLATE_MATCHING
)
import numpy as np
import tqdm
import argparse
import os
# os.system("clear")
os.chdir("/usr/src/app")

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Input data
# ------------------------------------------------- #
# ------------------------------------------------- #
# Parse argument of tournament_id
parser = argparse.ArgumentParser(description='Process tournament ID.')
parser.add_argument('--tournament_id', type=int, help='The tournament ID as an integer.')
args = parser.parse_args()
tournament_id = int(args.tournament_id)
print("Tournament ID:", tournament_id)

# Loading data
df_ref = pd.read_parquet(PATH_ANNOTATIONS_REFERENCE_PARQUET, engine="pyarrow")
df_master_videos = pd.read_parquet(PATH_MASTER_VIDEOS, engine="pyarrow")
df_meta = pd.read_parquet(PATH_VIDEOS_METADATA, engine="pyarrow")

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Run for a given tournament
# ------------------------------------------------- #
# ------------------------------------------------- #
snapshot_every_secs = 1
batch_size = BATCH_SIZE_TEMPLATE_MATCHING

# ---------------------------------------- #
#      Reference
# ---------------------------------------- #
# Get the reference court points and net
video_id, path, frame_num, court_points, net_points = Utils.get_ref_annot(df_ref, tournament_id)

# Reference histogram colors of each of the patches
l_ref_hist = Utils.get_histogram_reference(video_id=video_id, frame_num=frame_num, fs=fs)

# --------------------------------------- #
#      Query Frames
# --------------------------------------- #
# Get downloaded videos of that tournament
df_videos_tourn = df_master_videos.query(f"tournament_id == {tournament_id} & is_downloaded")

# Add video metadata
df_queries = pd.merge(
    df_videos_tourn[["video_id"]],
    df_meta,
    on="video_id",
    how="inner"
)

# ********************************** #
#     Iterate on videos (query)
# ********************************** #

# Iterate over videos we have downloaded and from that tournament
for _, row in tqdm.tqdm(df_queries.iterrows(), desc="Video iterator"):

    # .......................... #
    #   Video already processed
    # .......................... #
    # Check if video exists in the final folder
    if Utils.check_video_exist_template_matching(row.video_id, tournament_id):
        print(f"\nAlready existing template matching for video: {row.video_id}")
        continue
    else:
        print(f"\nVideo: {row.video_id}")

    # Path video
    path_video = Utils.path_video(row.video_id)

    # Total frames
    total_frames = row.frames

    # Number to take a snapshot each N frames
    snapshot_every_n_frames = int(snapshot_every_secs * row.fps)

    # List of frame numbers to do a snapshot
    l_frames = np.arange(0, total_frames, snapshot_every_n_frames)

    # Confidence dict
    d_confs = {}

    # .......................... #
    #   Batch iterate over frames
    # .......................... #
    # Iterate over batches (thanks to batches, we can load in parallel batches of size 20 of frames)
    # since the bottleneck is the cv2.VideoCapture latency to load a specific single frame.
    inner_tqdm = tqdm.tqdm(range(0, len(l_frames), batch_size), desc="Batch Progress", leave=False)
    for batch_num in inner_tqdm:
        # Get the batch of frames to load
        batch_frames = l_frames[batch_num:batch_num + batch_size]

        # Load this batch of frames
        d_img_frames = Utils.get_frames(path_video, batch_frames)

        # Iterate on each of the frames of the batch
        for frame_num in sorted(d_img_frames.keys()):
            # Get the frame as an image
            q_img = d_img_frames[frame_num]

            # Generate patches
            patches_q_img = Utils.generate_patches_of_image(q_img, fs)

            # Compute similarities (Bhattacharyya coefficients)
            l_sim_coeffs = Utils.get_bc_patches_similarities(patches_q_img, l_ref_hist)

            # Get confidence
            confidence = Utils.get_bc_conf(l_sim_coeffs)
            d_confs[frame_num] = confidence
    # Close the inner tqdm for the nested loop
    inner_tqdm.close()

    # .......................... #
    #   Persist video results
    #    on confidence scores
    # .......................... #
    df_confs = pd.DataFrame(d_confs.items(), columns=["frame_num", "confidence"])
    df_confs["video_id"] = row.video_id
    df_confs["tournament_id"] = tournament_id
    df_confs.to_parquet(PATH_TEMPLATE_MATCHING, partition_cols=["tournament_id", "video_id"], engine="pyarrow")
