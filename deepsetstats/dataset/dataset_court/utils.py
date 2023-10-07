import pandas as pd
import tqdm


# Function to find largest consecutive interval
# since we have sampled frames, each sampled frame is compared
# against the template matching (reference court of that tournament)
# and if the BC coeficient is high enough, we set this frame as a match
# with the template (indicating that the frame contains a court of that tournament)
# then, if consecutive sampled frames are identified as matching with the reference
# it means that the video sequence is an interval of seconds with the court being displayed
# in the video. We want to find intervals of for how long the courts in the video still match
# the reference court, and mark the start and end of that interval (usually the camera changes
# when there is a change in point), so in the future we expect camera changes to also indicate the
# end of a point
def find_largest_consecutive_interval(df, CONFIDENCE_THRESHOLD=5):

    results = []
    for video_id, group in tqdm.tqdm(df.groupby('video_id')):

        # Remember we sampled template_matching at the seconds
        min_length_seconds = 4

        consecutive_interval = []
        for _, row in group.iterrows():
            if row['confidence'] > CONFIDENCE_THRESHOLD:
                consecutive_interval.append(row['frame_num'])
            else:
                if len(consecutive_interval) >= min_length_seconds:
                    # If the so far accumulated consecutive frames
                    # are more than 4 seconds length, then

                    results.append({
                        'video_id': video_id,
                        'tournament_id': row["tournament_id"],
                        'interval_start': consecutive_interval[0],
                        'interval_end': consecutive_interval[-1]
                    })
                # Empty again the consecutive interval
                consecutive_interval = []

        # If the video ended up in the middle of a court scene, count this as
        # a consecutive interval if you gathered more than min_length_seconds seconds of interval
        if consecutive_interval:
            results.append({
                'video_id': video_id,
                'tournament_id': row["tournament_id"],
                'interval_start': consecutive_interval[0],
                'interval_end': consecutive_interval[-1]
            })

    return pd.DataFrame(results)


# Function to find lowest confidence consecutive interval. The same as before
# but the underlying data is for intervals of footages with no courts showing
# Hence, we pick the largest consectuve interval with a low confidence on having a court in it
def find_lowest_consecutive_interval(df, CONFIDENCE_THRESHOLD=2):
    results = []
    for video_id, group in tqdm.tqdm(df.groupby('video_id')):

        # Remember we sampled template_matching at the seconds
        min_length_seconds = 4

        consecutive_interval = []
        for _, row in group.iterrows():
            if row['confidence'] < CONFIDENCE_THRESHOLD:
                consecutive_interval.append(row['frame_num'])
            else:
                if len(consecutive_interval) >= min_length_seconds:
                    # If the so far accumulated consecutive frames
                    # are more than 4 seconds length, then

                    results.append({
                        'video_id': video_id,
                        'tournament_id': row["tournament_id"],
                        'interval_start': consecutive_interval[0],
                        'interval_end': consecutive_interval[-1]
                    })
                # Empty again the consecutive interval
                consecutive_interval = []

        # If the video ended up in the middle of a court scene, count this as
        # a consecutive interval if you gathered more than min_length_seconds seconds of interval
        if consecutive_interval:
            results.append({
                'video_id': video_id,
                'tournament_id': row["tournament_id"],
                'interval_start': consecutive_interval[0],
                'interval_end': consecutive_interval[-1]
            })

    return pd.DataFrame(results)
