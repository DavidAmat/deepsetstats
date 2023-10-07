import os
from os.path import join as j
import pandas as pd
import tqdm
import cv2

from deepsetstats.paths import (
    PATH_DATASET_COURT,
    PATH_IMAGES_DATASET_COURT
)
from deepsetstats.dataset.court_detection import utils

Utils = utils.Utils

# Dataset of images frames selected with their label (court or not) and frame number
df = pd.read_parquet(PATH_DATASET_COURT, engine="pyarrow")

# --------------------------------------- #
#    Save frames as images
# --------------------------------------- #
os.makedirs(PATH_IMAGES_DATASET_COURT, exist_ok=True)
for tournament_id, df_tour in tqdm.tqdm(df.groupby('tournament_id')):

    # Create a folder for each tournament
    path_folder_tourid = j(PATH_IMAGES_DATASET_COURT, f'tournament_id={tournament_id}')
    os.makedirs(path_folder_tourid, exist_ok=True)

    # Go video by video saving the frames
    for video_id, df_vid in df_tour.groupby('video_id'):
        # Get the video path
        path_video = Utils.path_video(video_id)

        # Get the list of frames selected by this video and its image name
        frames = df_vid["frame_id"].tolist()
        img_names = df_vid["name"].tolist()

        # Load the frames as numpy arrays (using threading for efficiently loading)
        d_frames = Utils.get_frames(path_video, frame_numbers=frames)

        # For each frame, save it
        for idx in range(len(df_vid)):
            frame_id = frames[idx]
            img_name = img_names[idx]
            frame = d_frames[frame_id]
            path_img = j(path_folder_tourid, img_name)
            cv2.imwrite(path_img, frame)
