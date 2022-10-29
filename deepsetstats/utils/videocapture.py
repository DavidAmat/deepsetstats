import cv2
from matplotlib import pyplot as plt


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
