import os

import yt_dlp as youtube_dl
from googleapiclient.discovery import build

# from deepsetstats.dataset.utils import master_prettify

# Replace 'YOUR_API_KEY' with your actual YouTube API key
API_KEY = "AIzaSyBNei4riOUMevYWoxQI244id_I1wq0lNhU"
# Replace 'VIDEO_ID' with the ID of the video you want to download
VIDEO_ID = "6eXG31O9mHU"

# Create a YouTube API client
youtube = build("youtube", "v3", developerKey=API_KEY)

# The search query
SEARCH_QUERY = "australia open highlights"

# Perform the search
search_response = (
    youtube.search().list(q=SEARCH_QUERY, part="id", maxResults=3).execute()
)

# Extract video IDs from the search results
video_ids = [
    item["id"]["videoId"]
    for item in search_response["items"]
    if item["id"]["kind"] == "youtube#video"
]

# Set options for the downloader
PATH_TO_SAVE = "videos"
ydl_opts = {
    "format": "bestvideo[ext=mp4]/best[ext=mp4]",  # Download the best quality available
    "outtmpl": f"{PATH_TO_SAVE}/video.%(ext)s",  # Specify the output template
}

d_vids = {}
d_info = {}
# Create the downloader
with youtube_dl.YoutubeDL(ydl_opts) as ydl:

    for index, video_id in enumerate(video_ids):
        # Get video details
        response = youtube.videos().list(part="snippet", id=video_id).execute()

        # Get the json
        d_vids[video_id] = response["items"][0]

        # info = ydl.extract_info(f'https://www.youtube.com/watch?v={VIDEO_ID}', download=True)
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

        # Format the filename based on the loop index
        filename = f"video_{index}.mp4"

        # Rename the downloaded file to the desired filename
        os.rename(f"{PATH_TO_SAVE}/video.mp4", f"{PATH_TO_SAVE}/{filename}")
