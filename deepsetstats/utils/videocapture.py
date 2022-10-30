import cv2
import numpy as np
from matplotlib import pyplot as plt

from deepsetstats.utils import constants as c


class VideoClass:
    def __init__(self, path):
        self.cap = cv2.VideoCapture(path)
        self.cap.set(1, 1)  # take one frame
        ret, frame = self.cap.read()
        self.h, self.w, self.ch = frame.shape

    def get_frame(self, frame_query, to_gray=False):
        # Where frame_no is the frame you want
        self.cap.set(1, frame_query)

        # Read the frame
        ret, frame = self.cap.read()
        frame_corrected = self._correct_color(frame, gray=to_gray)
        return frame_corrected

    def _correct_color(self, frame, gray=False):
        if gray:
            frame_corr = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            frame_corr = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return frame_corr

    @staticmethod
    def detect_court(img):
        # Crop image from center
        center = np.array(img.shape) / 2

        # Try different crops
        mean_rgb = []
        for size_crop in [100, 200, 300, 500]:
            x = center[1] - size_crop / 2
            y = center[0] - size_crop / 2
            crop_img = img[int(y) : int(y + size_crop), int(x) : int(x + size_crop)]
            mean_rgb.append(list(np.mean(np.mean(crop_img, axis=0), axis=0)))
        mRGB = np.mean(np.array(mean_rgb), axis=0)
        meanRGB_diff = np.mean(np.abs(mRGB - c.RGB_COURTS), axis=1)
        COURT_TYPE = c.LIST_COURTS[np.argmin(meanRGB_diff)]
        return mRGB, COURT_TYPE

    @staticmethod
    def get_line_mask(self, img, court_type):
        # ------------------------- #
        #     Line Tolerance
        # ------------------------- #
        RGB_LINE_DIRTY_TOL = c.D_GRAD_LINES[court_type]["LINE_DIRTY"] - c.TOL_LINE

        # ------------------------- #
        #     Get Mask
        # ------------------------- #
        # set the lower and upper bounds for the green hue
        lower_white = RGB_LINE_DIRTY_TOL
        upper_white = np.array([255, 255, 255])

        # create a mask for green colour using inRange function
        mask = cv2.inRange(img, lower_white, upper_white)
        return mask

    def get_num_frames(self):
        return int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))

    def get_fps(self):
        return int(self.cap.get(cv2.CAP_PROP_FPS))

    def get_frame_second(self, second):
        frame_num = int(second * self.get_fps())
        return self.get_frame(frame_num)

    @staticmethod
    def show_frame_gray(frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        plt.imshow(gray)
        plt.show()

    @staticmethod
    def show_frame(frame_rgb):
        plt.imshow(frame_rgb)
        plt.show()
