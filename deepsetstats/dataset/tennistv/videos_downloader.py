"""
This script is always executed in a notebook to monitor it carefully
This script iterates over all the highlights videos in Tennis TV YouTube channel or Grand Slam channel
and downloads the video in mp4. Because many issues can happen (i.e being blocked by IP) we monitor it
carefully in a Jupyter Notebook:

- Notebook: notebooks/datasets/05-download_videos_yt.ipynb
"""

import os

import pandas as pd
import yt_dlp as youtube_dl

from deepsetstats.paths import PATH_TENNIS_TV_VIDEOS, PATH_VIDEOS

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Read Table of Tennis TV videos
# ------------------------------------------------- #
# ------------------------------------------------- #
# Table of Tennis TV YouTube Videos
df = pd.read_parquet(PATH_TENNIS_TV_VIDEOS, engine="pyarrow")

# Get Highlights
dfh = df[df.title.str.contains("ighlights")]
dfh.reset_index(drop=True, inplace=True)

# ------------------------------------------------- #
# ------------------------------------------------- #
#      Folder to drop downloads
# ------------------------------------------------- #
# ------------------------------------------------- #
# Set the video extension
EXTENSION = ".mp4"

# Temporal directory to save downloaded videos and final directory
os.makedirs(PATH_VIDEOS, exist_ok=True)


# ------------------------------------------------- #
# ------------------------------------------------- #
#      Function to download videos
# ------------------------------------------------- #
# ------------------------------------------------- #
def download_video(video_id, path_out=PATH_VIDEOS):

    ydl_opts = {
        "format": "bestvideo[ext=mp4]/best[ext=mp4]",  # Download the best quality available
        "outtmpl": f"{path_out}/{video_id}.%(ext)s",  # Specify the output template
    }

    # Create the downloader
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

    return True


# ------------------------------------------------- #
# ------------------------------------------------- #
#      Iterate on videos
# ------------------------------------------------- #
# ------------------------------------------------- #

# --------------------------------------- #
#      Video NOT downloaded already check
# --------------------------------------- #
l_videos_downloaded = os.listdir(PATH_VIDEOS)

# Set of already downloaded videos
s_videos_downloaded = set()

for vid in l_videos_downloaded:
    if vid.endswith(EXTENSION):
        vid_id = vid.split(EXTENSION)[0]
        s_videos_downloaded.add(vid_id)

# --------------------------------------- #
#     Marking existing videos
# --------------------------------------- #
d_success = {
    vid_id: True for vid_id in list(s_videos_downloaded)
}

print(f"Already existing: {len(d_success)} videos downloaded")

# --------------------------------------- #
#     Starting to download
# --------------------------------------- #
for i, row in dfh.iterrows():
    vid_id = row["video_id"]

    # If video already downloaded, do not download it again
    if vid_id in d_success:
        continue
    if vid_id in s_videos_downloaded:
        continue

    if (i % 50) == 0:
        print("--" * 30)
        print("--" * 30)
        print(f"Iteration: {i}")
        print("--" * 30)
        print("--" * 30)

    # Download video
    print("--" * 30)
    print("DOWNLOADING VIDEO:", vid_id)
    print("--" * 30)
    tt = download_video(vid_id)
    if tt:
        d_success[vid_id] = True
