import colorsys

import cv2
import numpy as np
import pandas as pd
from scipy.spatial import distance_matrix

import deepsetstats.utils.constants as c
from deepsetstats.utils.utils_dataclasses import ConfigHist


class Colors:
    @staticmethod
    def rgb_to_hex(rgb_list):
        f_list = []
        for rgb in rgb_list:
            f_list.append("#" + "".join(["%0.2X" % c for c in rgb]))
        return f_list

    @staticmethod
    def hsv2rgb(color_hsv):
        (h, s, v) = color_hsv
        (r, g, b) = colorsys.hsv_to_rgb(h, s, v)
        (r, g, b) = (int(r * 255), int(g * 255), int(b * 255))
        return (r, g, b)

    @staticmethod
    def frame2hsv(frame):
        return cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)

    @staticmethod
    def frame2lab(frame):
        reshape_final = False
        if frame.dtype != np.uint8:
            frame = np.uint8(frame)
        if len(frame.shape) == 2:
            frame = frame.reshape(1, -1, 3)
            reshape_final = True
        frame_lab = cv2.cvtColor(frame, cv2.COLOR_RGB2LAB)
        if reshape_final:
            frame_lab = frame_lab.reshape(-1, 3)
        return frame_lab

    @staticmethod
    def l_rgb2lab(l_rgb):
        l_lab = cv2.cvtColor(np.uint8(l_rgb).reshape(1, -1, 3), cv2.COLOR_RGB2LAB)
        return [tuple(ii) for ii in l_lab.squeeze()]

    # -------------------------------------------------- #
    # -------------------------------------------------- #
    #           Histogram in HSV approach
    # -------------------------------------------------- #
    # -------------------------------------------------- #

    @staticmethod
    def create_bins_hsv(tup_diff, tup_max):
        diff_bins_1, diff_bins_2, diff_bins_3 = tup_diff
        max_1, max_2, max_3 = tup_max

        bins_1 = np.arange(0, max_1 + diff_bins_1, diff_bins_1)
        bins_2 = np.arange(0, max_2 + diff_bins_2, diff_bins_2)
        bins_3 = np.arange(0, max_3 + diff_bins_3, diff_bins_3)

        return bins_1, bins_2, bins_3

    @staticmethod
    def get_bins_hsv(frame_hsv, tup_diff_hsv, tup_max_hsv):
        bins_hue, bins_sat, bins_val = Colors.create_bins_hsv(tup_diff_hsv, tup_max_hsv)
        dig_hue = np.digitize(frame_hsv[:, :, 0].ravel(), bins_hue) - 1
        dig_sat = np.digitize(frame_hsv[:, :, 1].ravel(), bins_sat) - 1
        dig_val = np.digitize(frame_hsv[:, :, 2].ravel(), bins_val) - 1

        # Concatenate together
        tup_hw = frame_hsv.shape[:2]
        bins_frame_hsv = np.stack(
            (dig_hue.reshape(tup_hw), dig_sat.reshape(tup_hw), dig_val.reshape(tup_hw)),
            axis=-1,
        )
        return bins_frame_hsv, (bins_hue, bins_sat, bins_val)

    @staticmethod
    def get_top_colors(frame_hsv, tup_diff_hsv, tup_max_hsv, top_k=5):
        cols_bin = ["hue_bin", "sat_bin", "val_bin"]
        cols = ["hue", "sat", "val"]
        bins_frame_hsv, (bins_hue, bins_sat, bins_val) = Colors.get_bins_hsv(
            frame_hsv, tup_diff_hsv, tup_max_hsv
        )
        df = pd.DataFrame(bins_frame_hsv.reshape(-1, 3), columns=cols_bin)
        df["count"] = 1
        df_hsv_top_colors = (
            df.groupby(cols_bin)["count"]
            .sum()
            .reset_index()
            .sort_values("count", ascending=False)
            .head(top_k)
        )
        df_hsv_top_colors["hue"] = bins_hue[df_hsv_top_colors["hue_bin"]]
        df_hsv_top_colors["sat"] = bins_sat[df_hsv_top_colors["sat_bin"]]
        df_hsv_top_colors["val"] = bins_val[df_hsv_top_colors["val_bin"]]
        hsv_arr = np.uint8(df_hsv_top_colors[cols].values.reshape(1, -1, 3))
        top_rgb = cv2.cvtColor(hsv_arr, cv2.COLOR_HSV2RGB)
        top_rgb = [tuple(xx) for xx in list(top_rgb.reshape(-1, 3))]
        return top_rgb

    @staticmethod
    def run_top_colors_court(frame, top_k=4, tol_lab=6):
        frame_hsv = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)
        tup_diff_hsv = (10, 15, 20)
        tup_max_hsv = (180, 255, 255)
        top_rgb = Colors.get_top_colors(
            frame_hsv, tup_diff_hsv, tup_max_hsv, top_k=top_k
        )
        top_lab = cv2.cvtColor(np.uint8(top_rgb).reshape(1, -1, 3), cv2.COLOR_RGB2LAB)
        ab_colors = top_lab.squeeze()[:, 1:]
        mat_distances = distance_matrix(ab_colors, ab_colors)
        mask_distances = np.where(mat_distances < tol_lab, 1, 0)
        mask_distances = mask_distances * np.tri(*mask_distances.shape)
        np.fill_diagonal(mask_distances, 0)
        row_idx, col_idx = np.where(mask_distances)
        top_rgb = [
            top_rgb[i_col] for i_col in range(len(top_rgb)) if i_col not in row_idx
        ]
        top_hex = Colors.rgb_to_hex(top_rgb)
        top_lab = cv2.cvtColor(np.uint8(top_rgb).reshape(1, -1, 3), cv2.COLOR_RGB2LAB)
        return top_rgb, top_hex, top_lab.reshape(-1, 3)

    # -------------------------------------------------- #
    # -------------------------------------------------- #
    #           Histogram in LAB approach
    # -------------------------------------------------- #
    # -------------------------------------------------- #
    @staticmethod
    def get_lab_histogram(frame_lab, cfg: ConfigHist, court_type=""):
        cfg.range_l = np.linspace(0, cfg.limit, cfg.bins_l)
        cfg.range_a = np.linspace(0, cfg.limit, cfg.bins)
        cfg.range_b = np.linspace(0, cfg.limit, cfg.bins)

        cfg.l_diff = cfg.range_l[1] - cfg.range_l[0]
        cfg.a_diff = cfg.range_a[1] - cfg.range_a[0]
        cfg.b_diff = cfg.range_b[1] - cfg.range_b[0]

        histr = cv2.calcHist(
            [frame_lab],
            channels=[0, 1, 2],
            mask=None,
            histSize=[cfg.bins_l, cfg.bins, cfg.bins],
            ranges=[0, cfg.limit, 0, cfg.limit, 0, cfg.limit],
        )
        histr /= histr.sum()
        cfg.histr = histr
        Colors.get_lab_top_colors(cfg)
        Colors.clean_lab_top_colors(cfg)
        Colors.get_lab_top_colors_clean(cfg)
        Colors.add_extra_colors(cfg, court_type)

    @staticmethod
    def get_lab_top_colors(cfg: ConfigHist):
        hist_ravel = cfg.histr.ravel()
        topk = cfg.topk + 1  # for the ediff purposes
        ind = np.argpartition(hist_ravel, -topk)[-topk:]
        cfg.topk_freq = np.sort(hist_ravel[ind])[::-1]
        # return cfg

    @staticmethod
    def clean_lab_top_colors(cfg: ConfigHist):
        topk_freq_clean = []
        freq_diff = np.abs(np.ediff1d(cfg.topk_freq))
        for ii in range(len(freq_diff)):
            if cfg.topk_freq[ii] > cfg.th_freq:
                topk_freq_clean.append(cfg.topk_freq[ii])
            if freq_diff[ii] > cfg.th_freq_diff:
                break
        cfg.topk_freq_clean = topk_freq_clean
        # return cfg

    @staticmethod
    def get_lab_top_colors_clean(cfg):
        min_freq_topk = np.min(cfg.topk_freq_clean)
        i_bins_l, i_bins_a, i_bins_b = np.where(cfg.histr >= min_freq_topk)

        top_lab = []
        for bin_l, bin_a, bin_b in zip(i_bins_l, i_bins_a, i_bins_b):
            top_lab.append((cfg.range_l[bin_l], cfg.range_a[bin_a], cfg.range_b[bin_b]))
        cfg.top_lab = np.array(top_lab)
        # return cfg

    @staticmethod
    def add_extra_colors(cfg, court_type):
        extra_top_colors = c.LAB_EXTRA_COLORS.get(court_type)
        if extra_top_colors is not None:
            cfg.top_lab = np.vstack((cfg.top_lab, extra_top_colors))
