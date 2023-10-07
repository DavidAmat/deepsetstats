import pandas as pd
import numpy as np
import os
import tqdm
from deepsetstats.paths import (
    PATH_VIDEOS_METADATA,
    PATH_TEMPLATE_MATCHING,
    PATH_INTERVALS,
    PATH_INTERVALS_NOT_COURT,
    PATH_DATASET_COURT
)

from deepsetstats.dataset.court_detection.utils import Utils
from deepsetstats.dataset.dataset_court.utils import (
    find_largest_consecutive_interval,
    find_lowest_consecutive_interval
)


# Load utils
ut = Utils()
COLS = ["tournament_id", "video_id", "interval_id", "frame_id", "is_court", "name"]

# Specify the confidence threshold
# We do 8 comparisons of bounding boxes of the reference court
# with the frame to analyze. We set 4 bounding boxes and compute BC
# coefficient of the color histograms of the same location in the reference
# compared to the query frame. For each bounding box we compare the BC
# coefficient with 0.3 (THRES_BC_HIGH_CONF) and 0.5 (THRES_BC_LOW_CONF).
# If all 4 bounding boxes have identical color distribution, all thresholds will be met
# so there will be 8 conditions met (low and high for each bbox). Hence, if a frame
# surpasses 4 or more (since players position may distort color distribution), then
# we use this rule of thumb to assess that we are confident the frame has a court in it.
CONFIDENCE_THRESHOLD = 4

# --------------------------------------- #
#      Read Master of videos
# --------------------------------------- #
df_temp_match = pd.read_parquet(PATH_TEMPLATE_MATCHING, engine="pyarrow")
df_meta_videos = pd.read_parquet(PATH_VIDEOS_METADATA, engine="pyarrow")

# Get mappings
vid2fps = df_meta_videos.set_index('video_id')['fps'].to_dict()

# --------------------------------------- #
#      Read Tournaments
# --------------------------------------- #
tournaments = sorted(df_temp_match["tournament_id"].unique())


# --------------------------------------- #
# --------------------------------------- #
#      Consecutive intervals
# --------------------------------------- #
# --------------------------------------- #
def annotate_interval(df):
    # Bring fps
    df["fps"] = df["video_id"].map(vid2fps)

    # Starting and ending seconds of court
    df["sec_start"] = df["interval_start"] / df["fps"]
    df["sec_end"] = df["interval_end"] / df["fps"]
    df["interval_duration"] = df["interval_end"] - df["interval_start"]

    # Create interval_id
    df["interval_id"] = df.groupby("video_id").cumcount() + 1
    return df


# Check if path of COURT intervals exist
if os.path.exists(PATH_INTERVALS):
    print(f"Found intervals at: {PATH_INTERVALS}")
    df_intervals = pd.read_parquet(PATH_INTERVALS, engine="pyarrow")
else:
    # Find the largest consecutive intervals
    CONFIDENCE_THRESHOLD = 4
    df_intervals = find_largest_consecutive_interval(df_temp_match, CONFIDENCE_THRESHOLD)
    df_intervals = annotate_interval(df_intervals)
    df_intervals.to_parquet(PATH_INTERVALS, engine="pyarrow")

# Check if path of NOT COURT intervals exist
if os.path.exists(PATH_INTERVALS_NOT_COURT):
    print(f"Found intervals at: {PATH_INTERVALS_NOT_COURT}")
    df_intervals_low = pd.read_parquet(PATH_INTERVALS_NOT_COURT, engine="pyarrow")
else:
    # Find the largest consecutive intervals
    CONFIDENCE_THRESHOLD = 2
    df_intervals_low = find_lowest_consecutive_interval(df_temp_match, CONFIDENCE_THRESHOLD)
    df_intervals_low = annotate_interval(df_intervals_low)
    df_intervals_low.to_parquet(PATH_INTERVALS_NOT_COURT, engine="pyarrow")


# --------------------------------------- #
# --------------------------------------- #
#    Create Dataset of Courts
# --------------------------------------- #
# --------------------------------------- #
def create_sample_name(tournament_id, video_id, interval_id, frame_num):
    """
    Method to create the reference court images used to set the reference keypoints
    of the corners of the tennis court
    """
    # Decide if is court shown or not
    iscourt = True
    if interval_id == 0:
        iscourt = False

    # Naming of file starts different if is court
    if iscourt:
        prefix = "court"
    else:
        prefix = "nocourt"
    return f"{prefix}___t{tournament_id}___v{video_id}___i{interval_id}___f{frame_num}.png"


def create_d_dataset_ref_court():
    return {
        cc: [] for cc in COLS
    }


def update_dict(d, *args):
    for arg, col in zip(args, COLS):
        d[col].append(arg)


# --------------------------------------- #
#    Logic to sample frames
# --------------------------------------- #
# We take for each interval, a random frame between the frame start and frame end
# To create negative samples (frames with no court in the image, maybe the camera is focusing on
# the player's face), we take a random frame between the previous interval end frame
# and the following interval start frame.
# We sample 4 frames (MAX_SAMPLES) (2 positives, and 2 negatives) for each video id.
# For negative samples, we will report in the table indicating the interval_id as 0
# since all interval_ids start with 1. So 0 is reserved for a frame selected from a
# negative interval, which means that this frame in principle does not show any court.
# Set a random seed (you can use any integer value)
np.random.seed(52)
MAX_SAMPLES_GS = 1
MAX_SAMPLES_MASTERS = 5
set_grandslams = {0, 1, 2, 3}
NULL_COURT_INTERVAL_ID = 0
d_dataset_ref_court = create_d_dataset_ref_court()
skipped_videos = set()

for idx_is_court, df_it in enumerate([df_intervals_low, df_intervals]):
    # idx_is_court: 0 (i.e False) for the intervals dataframe of not courts fully visible
    # idx_is_court: 1 (i.e True) for the intervals dataframe of courts visible

    for tournament_id, group in tqdm.tqdm(df_it.groupby('tournament_id')):

        # Check if grand slam, cause we are going to sample less, since more videos are from Grand Slams
        is_grandslam = tournament_id in set_grandslams

        for video_id, df_intervals_video in group.groupby('video_id'):

            # Ensure interval start always is smaller than interval end
            df_intervals_video = df_intervals_video[df_intervals_video["interval_start"] < df_intervals_video["interval_end"]].copy()

            # Ensure we still have samples
            if len(df_intervals_video) < 1:
                # print(f"Skipping video {video_id} for interval consistency (check 1)")
                skipped_videos.add(video_id)
                continue

            # Pick a sample between interval_start and interval_end
            df_intervals_video["frame_num_selected"] = np.random.randint(df_intervals_video["interval_start"], df_intervals_video["interval_end"])

            # Sample intervals from this video
            num_intervals = len(df_intervals_video)
            max_samples_selection = MAX_SAMPLES_GS if is_grandslam else MAX_SAMPLES_MASTERS
            num_sampling = min(max_samples_selection, num_intervals)

            # Sample it
            df_sample = df_intervals_video.sample(num_sampling)

            # Iterate through this dataframe
            for _, row in df_sample.iterrows():
                # All the samples of that dataframe are either all court or all no court (this is why we have the outer most for loop)
                is_court = True if idx_is_court == 1 else False

                # Set the interval_id to 0 if the frame is not from a court
                # (a frame inside the interval start and end of that interval_id)
                interval_id = row["interval_id"] if is_court else NULL_COURT_INTERVAL_ID

                # Frame number selected
                frame_num = row["frame_num_selected"]

                # Create sample name
                img_name = create_sample_name(
                    tournament_id=tournament_id,
                    video_id=video_id,
                    interval_id=interval_id,
                    frame_num=frame_num
                )

                # Register sample
                # "tournament_id", "video_id", "interval_id", "frame_id", "is_court", "name"
                update_dict(d_dataset_ref_court, tournament_id, video_id, interval_id, frame_num, is_court, img_name)


# --------------------------------------- #
#    Save Dataset Reference Courts
# --------------------------------------- #
df_dataset_ref_court = pd.DataFrame(d_dataset_ref_court)
df_dataset_ref_court.to_parquet(PATH_DATASET_COURT, engine="pyarrow")
