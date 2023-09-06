from __future__ import print_function

import os
import random
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from os.path import join as jp

import cv2
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from sklearn.metrics import mean_squared_error as mse

from deepsetstats.dataset.court_detection.constants import (
    THRES_BC_HIGH_CONF,
    THRES_BC_LOW_CONF,
)
from deepsetstats.paths import PATH_VIDEOS


class Utils:

    # ------------------------------------------------- #
    # ------------------------------------------------- #
    #      Utils for Reference Court selection
    # ------------------------------------------------- #
    # ------------------------------------------------- #
    @staticmethod
    def full_parse_img_ref(string):
        pattern = r'ref___l(.*?)___t(.*?)___v(.*?)___f(.*?).png'
        match = re.search(pattern, string)

        if match:
            level = match.group(1)
            tourn_id = match.group(2)
            video_id = match.group(3)
            frame_num = match.group(4)
            return string, level, int(tourn_id), video_id, int(frame_num)
        else:
            return None, None, None, None, None

    @staticmethod
    def create_img_name(level, tournament_id, video_id, frame_num):
        return f"ref___l{level}___t{tournament_id}___v{video_id}___f{frame_num}.png"

    @staticmethod
    def parse_img_ref(string):
        pattern_vid = r'___v(.*?)___f'
        pattern_tourn = r'___t(.*?)___v'
        match = re.search(pattern_vid, string)
        match_tourn = re.search(pattern_tourn, string)

        if match and match_tourn:
            video_id = match.group(1)
            tourn_id = match_tourn.group(1)
            return video_id, int(tourn_id)
        else:
            return None, None

    @staticmethod
    def bgr_to_rgb(img_bgr):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        return img_rgb

    @staticmethod
    def rgb_to_bgr(img_rgb):
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        return img_bgr

    @staticmethod
    def plot_img_rgb(img_rgb):

        # Plot the first frame using matplotlib
        plt.imshow(img_rgb)
        plt.axis("off")  # Turn off axis labels and ticks
        plt.show()

    @staticmethod
    def save_bgr_img(path, img_bgr):
        cv2.imwrite(path, img_bgr)

    @staticmethod
    def get_random_frame(video_id, frame_num_input=None, is_grand_slam=False):
        filename = f'{video_id}.mp4'
        path_video_id = jp(PATH_VIDEOS, filename)

        if not os.path.exists(path_video_id):
            print(f"Warning! does not exist path: {path_video_id}")
            return False, False, 0

        # Open the video capture object
        cap = cv2.VideoCapture(path_video_id)

        # Get the total number of frames in the video
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if frame_num_input is None:
            # Select a random frame
            random_frame_index = random.randint(0, total_frames - 1)
        else:
            random_frame_index = frame_num_input

        # Set the frame position to the random index
        cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame_index)

        # Read the frame at the random index
        ret, frame_bgr = cap.read()

        # Convert the frame from BGR to RGB
        frame_rgb = Utils.bgr_to_rgb(frame_bgr)

        # Plot the first frame using matplotlib
        Utils.plot_img_rgb(frame_rgb)

        return frame_bgr, True, random_frame_index

    @staticmethod
    def list_videos(path):
        extension = ".mp4"
        l_videos_downloaded = os.listdir(path)

        # Set of already downloaded videos
        s_videos_downloaded = set()

        for vid in l_videos_downloaded:
            if vid.endswith(extension):
                vid_id = vid.split(extension)[0]
                s_videos_downloaded.add(vid_id)
        return s_videos_downloaded

    # ------------------------------------------------- #
    # ------------------------------------------------- #
    #      Utils for Template Matching
    # ------------------------------------------------- #
    # ------------------------------------------------- #
    # Template matching means selecting a frame
    # that is similar to the reference court image
    # so that we can infer the corners of that frame
    # thanks to the labelled corners of the reference court
    @staticmethod
    def path_video(video_id):
        return f'{PATH_VIDEOS}/{video_id}.mp4'

    @staticmethod
    def capture_frame(cap, frame_num):
        frame = Utils.get_frame(cap, frame_num)
        return frame

    @staticmethod
    def get_video(video_path):
        return cv2.VideoCapture(video_path)

    @staticmethod
    def get_frame(cap, frame_num):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)

        # Read the frame
        _, frame = cap.read()

        return frame

    @staticmethod
    def get_total_frames(cap):
        # Get the total number of frames in the video
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        return frames

    @staticmethod
    def get_fps_video(cap):
        # Get the frames per second (fps) of the video
        fps = cap.get(cv2.CAP_PROP_FPS)

        return fps

    @staticmethod
    def plot_frames_grid(frames, nrows, ncols, size=(14, 11)):
        # Create a 4x4 grid of subplots
        fig, axes = plt.subplots(nrows, ncols, figsize=size)

        # Add content to each subplot (replace this with your data)
        idx = 0
        for i in range(nrows):
            for j in range(ncols):
                frame = frames[idx]
                ax = axes[i, j]
                ax.imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                idx += 1

        # Adjust spacing between subplots
        plt.tight_layout()

        # Show the plot
        plt.show()

    @staticmethod
    def plot_frame(frame, size=(14, 11)):
        # Create a figure and axis for plotting
        fig, ax = plt.subplots(figsize=size)

        # Display the frame
        ax.imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        return fig, ax

    @staticmethod
    def plot_net(ax, net_points, frame):
        # Draw the net (rectangle) on the frame in green
        net_points = np.array(net_points, dtype=int)
        cv2.polylines(frame, [net_points], isClosed=True, color=(0, 255, 0), thickness=2)
        ax.imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        return ax

    @staticmethod
    def plot_court(ax, court_points):
        # Extract court points and scatter them as black points
        court_points = np.array(court_points, dtype=int)
        ax.scatter(court_points[:, 0], court_points[:, 1], c='black', s=5)
        return ax

    @staticmethod
    def get_patch(image, court_points, idx, w=25):
        kp = court_points[idx]
        x, y = kp
        x = int(x)
        y = int(y)
        patch = image[y - w : y + w, x - w : x + w, :]
        return patch

    @staticmethod
    def patch_image(image, center, w=(25, 25)):
        x, y = center
        wx, wy = w
        x = int(x)
        y = int(y)
        patch = image[y - wy : y + wy, x - wx : x + wx, :]
        return patch

    @staticmethod
    def match_patch(img, patch, window_template, loc_at_center=True):
        # Template matching
        match_method = cv2.TM_SQDIFF
        result = cv2.matchTemplate(img, patch, match_method)

        # Find the minimum value (best match) and its location
        # this is the top left corner of the box
        min_val, _, min_loc, _ = cv2.minMaxLoc(result)

        # Subtract the width to all tuple elements since we convert
        # top left into the center of the patch
        if loc_at_center:
            match_loc = Utils.op_tuples(min_loc, window_template)
        else:
            match_loc = min_loc

        return match_loc, min_val

    @staticmethod
    def wrap_match_patch(img, patch, ii):
        return Utils.match_patch(img, patch), ii

    @staticmethod
    def eval_match_patch(match_loc, true_loc):
        # Convert the float target center of the patch into integers
        true_loc = tuple(map(lambda x: int(x), true_loc))
        return mse(true_loc, match_loc)

    @staticmethod
    def match_all_patches(img, patches):
        d_match_loc = {}
        with ThreadPoolExecutor(len(patches)) as executor:
            pool_res = [executor.submit(Utils.wrap_match_patch, img, patch, idx_patch) for idx_patch, patch in enumerate(patches)]
            for future_res in as_completed(pool_res):
                res_match_patch, idx_patch = future_res.result()
                d_match_loc[idx_patch] = res_match_patch
        return d_match_loc

    @staticmethod
    def op_tuples(tuple1, tuple2, op="add"):
        if op == "add":
            result = tuple(x + y for x, y in zip(tuple1, tuple2))
        elif op == "subtract":
            result = tuple(x - y for x, y in zip(tuple1, tuple2))
        else:
            result = None
        return result

    @staticmethod
    def draw_circle(img, pos, plot=True):
        x_img = img.copy()
        color = (0, 0, 255)
        size = 10
        x_img = cv2.circle(x_img, pos, size, color, -1)
        if plot:
            Utils.plot_frame(x_img, size=(8, 3))
            return
        return x_img

    @staticmethod
    def from_bgr_to_pil(img):
        # Load and preprocess the first image
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb_img)
        return pil

    @staticmethod
    def get_roi(image, frac_start=1. / 6, frac_end=1. / 6):
        # Define the region of interest (ROI)
        H, W, _ = image.shape
        roi_start_h = int(H * frac_start)
        roi_end_h = int(H * frac_end)
        roi_start_w = int(W * frac_start)
        roi_end_w = int(W * frac_end)
        return roi_start_h, roi_end_h, roi_start_w, roi_end_w

    @staticmethod
    def get_roi_xy(image, fx_s=1. / 6, fx_e=2. / 6, fy_s=1. / 6, fy_e=2. / 6):
        # Define the region of interest (ROI)
        H, W, _ = image.shape
        roi_start_h = int(H * fy_s)
        roi_end_h = int(H * fy_e)
        roi_start_w = int(W * fx_s)
        roi_end_w = int(W * fx_e)
        return roi_start_h, roi_end_h, roi_start_w, roi_end_w

    @staticmethod
    def get_mask_xy(image, fx_s=1. / 6, fx_e=2. / 6, fy_s=1. / 6, fy_e=2. / 6):
        H, W, _ = image.shape
        sh, eh, sw, ew = Utils.get_roi(image, fx_s, fx_e, fy_s, fy_e)
        # Create a mask for the ROI
        mask = np.zeros((H, W), dtype=np.uint8)
        mask[sh:eh, sw:ew] = 255
        return mask

    @staticmethod
    def get_image_mask_xy(image, fx_s, fx_e, fy_s, fy_e):
        H, W, _ = image.shape
        sh, eh, sw, ew = Utils.get_roi_xy(image, fx_s, fx_e, fy_s, fy_e)
        patch = image[sh:eh, sw:ew]
        return patch

    @staticmethod
    def get_mask(image, frac_start, frac_end):
        H, W, _ = image.shape
        sh, eh, sw, ew = Utils.get_roi(image, frac_start, frac_end)
        # Create a mask for the ROI
        mask = np.zeros((H, W), dtype=np.uint8)
        mask[sh:eh, sw:ew] = 255
        return mask

    @staticmethod
    def get_image_mask(image, frac_start, frac_end):
        H, W, _ = image.shape
        sh, eh, sw, ew = Utils.get_roi(image, frac_start, frac_end)
        patch = image[sh:eh, sw:ew]
        return patch

    @staticmethod
    def get_hist(image):
        # Compute the histogram
        f_hist = cv2.calcHist(
            images=[image],
            channels=[0],
            mask=None,
            histSize=[30],
            ranges=[0, 180]
        )
        return f_hist.ravel()

    @staticmethod
    def get_hist_on_patch_masked(image, f1, f2):
        # Convert BGR image to HSV format
        hsv_f_img = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Generate a mask
        f_mask = Utils.get_mask(image, f1, f2)

        # Compute the histogram
        f_hist = cv2.calcHist(
            images=[hsv_f_img],
            channels=[0],
            mask=f_mask,
            histSize=[30],
            ranges=[0, 180]
        )
        return f_hist.ravel()

    @staticmethod
    def patch_similarity(patch1, patch2):
        patch1_hist = Utils.get_hist(patch1)
        patch2_hist = Utils.get_hist(patch2)

        # Calculate the Bhattacharyya coefficient
        bc = cv2.compareHist(patch1_hist, patch2_hist, cv2.HISTCMP_BHATTACHARYYA)
        return bc

    @staticmethod
    def patch_similarity_on_template(q_patch, t_hist):
        patch_q_hist = Utils.get_hist(q_patch)

        # Calculate the Bhattacharyya coefficient
        bc = cv2.compareHist(t_hist, patch_q_hist, cv2.HISTCMP_BHATTACHARYYA)
        return bc

    @staticmethod
    def generate_patches_of_image(image, patches_fractions):
        """
            patches_fractions: includes a tuple (frac_x_start, frac_x_end, frac_y_start, frac_y_end)
        """
        l_fr = []
        for ii in range(len(patches_fractions)):
            fxs, fxe, fys, fye = patches_fractions[ii]
            fr = Utils.get_image_mask_xy(image, fxs, fxe, fys, fye)
            l_fr.append(fr)
        return l_fr

    @staticmethod
    def get_bc_conf(list_of_bc_coefficients):
        """
        We will input a list of N elements
        These elements are the patch_similarity_on_template outputs
        These outputs are the similarities of the N patches of query
        compared to the corresponding patch on the reference image.
        We set two thresholds for the Bhattacharyya coefficients:
        - High (0.3): if the BC coefficient of the comparison
            of the query to the reference of that patch is <0.3
            then we will +1 to the final confidence
        - Low (0.5): if the BC coefficient of the comparison
            of the query to the reference of that patch is <0.5
            then we will +1 to the final confidence
        Since we have N=4 patches, and two thresholds, we
        can opt for a confidence at most of 8 and at minimum of 0
        A confidence of 8 indicates super similar query to reference image in all patches
        """
        l_bc = np.array(list_of_bc_coefficients)
        n_match_low_conf = np.sum(l_bc < THRES_BC_LOW_CONF)
        n_match_high_conf = np.sum(l_bc < THRES_BC_HIGH_CONF)
        confidence = n_match_low_conf + n_match_high_conf
        return confidence
