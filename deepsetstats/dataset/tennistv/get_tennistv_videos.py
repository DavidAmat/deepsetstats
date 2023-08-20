import os
import time

import pandas as pd
from googleapiclient.discovery import build

os.chdir("/usr/src/app")

# from deepsetstats.dataset.utils import master_prettify

# Replace 'YOUR_API_KEY' with your actual YouTube API key
API_KEY = os.environ["API_KEY"]

# Tennis TV Channel
CHANNEL_ID = "UCbcxFkd6B9xUU54InHv4Tig"

# Path dataframe
PATH_TENNIS_TV_VIDEOS = "deepsetstats/dataset/tennistv/parquet/tennistv_videos.parquet"

# Create a YouTube API client
youtube = build("youtube", "v3", developerKey=API_KEY)

# Channels contents
channel_response = (
    youtube.channels().list(id=CHANNEL_ID, part="contentDetails").execute()
)

# Get playlist ID for uploads of the channel
uploads_playlist_id = channel_response["items"][0]["contentDetails"][
    "relatedPlaylists"
]["uploads"]

# Get all videos from the uploads playlist
video_info = []
next_page_token = None
pages = 7600 // 50

for page in range(0, int(pages) + 1):
    print(f"Page: {page}")
    playlist_items_response = (
        youtube.playlistItems()
        .list(
            playlistId=uploads_playlist_id,
            part="contentDetails",
            maxResults=50,  # Maximum value allowed by API
            pageToken=next_page_token,
        )
        .execute()
    )

    playlist_items = playlist_items_response["items"]
    video_ids = [item["contentDetails"]["videoId"] for item in playlist_items]

    video_response = (
        youtube.videos().list(id=",".join(video_ids), part="snippet").execute()
    )

    for item in video_response["items"]:
        snippet = item["snippet"]
        video_info.append(
            {
                "title": snippet["title"],
                "video_id": item["id"],
                "date_publish": snippet["publishedAt"],
            }
        )

    next_page_token = playlist_items_response.get("nextPageToken")

    # Break the loop if there are no more pages to retrieve
    if not next_page_token:
        break

    if (page % 10) == 0:
        # Sleep
        print("sleeping...")
        time.sleep(30)

df = pd.DataFrame(video_info)
df.to_parquet(PATH_TENNIS_TV_VIDEOS, engine="pyarrow")
