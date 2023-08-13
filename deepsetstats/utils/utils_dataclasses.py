from dataclasses import dataclass, field
from typing import Tuple

import numpy as np


# -------------------------
#      GRID
# -------------------------
@dataclass
class ConfigGrid:

    frame_shape_hw: Tuple
    w: int
    h: int
    slices_xy: Tuple
    marg_xy: Tuple
    xx: np.ndarray
    yy: np.ndarray
    xx2: np.ndarray
    yy2: np.ndarray
    x_diff: int
    y_diff: int
    num_slices: int = 17
    margin_portion: int = 20

    def __init__(self, frame) -> None:
        self.frame_shape_hw = frame.shape[:2]
        self.h, self.w = self.frame_shape_hw
        self.slices_xy = (self.num_slices, self.num_slices)
        self.marg_xy = (self.w // self.margin_portion, self.h // self.margin_portion)


# -------------------------
#      HISTOGRAM
# -------------------------
@dataclass
class ConfigHist:
    limit: int = 256
    bins_l: int = 10
    bins: int = 32

    # ************************#
    #      Thresholds
    # ************************#
    # if the dominance difference between that color and the
    # next frequent is 25%, drop the next colors
    th_freq_diff: float = 0.25

    # if the frequency of that bin does not represent more than 10% of the color
    # in the image, do not take it as a top color
    th_freq: float = 0.1
    topk: int = 5

    # ************************#
    #      Arrays
    # ************************#
    range_l: np.ndarray = field(default_factory=np.array([]))
    range_a: np.ndarray = field(default_factory=np.array([]))
    range_b: np.ndarray = field(default_factory=np.array([]))
    l_diff: np.ndarray = field(default_factory=np.array([]))
    b_diff: np.ndarray = field(default_factory=np.array([]))
    a_diff: np.ndarray = field(default_factory=np.array([]))
    histr: np.ndarray = field(default_factory=np.array([]))
    topk_freq: np.ndarray = field(default_factory=np.array([]))
    top_lab: np.ndarray = field(default_factory=np.array([]))
