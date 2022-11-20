import numpy as np
from scipy import signal


class EdgeDetect:
    def __init__(self, val=1, th=50):
        self.th = th
        self.my_filter = np.array(
            [
                [-val, 0, val],
                [-val, 0, val],
                [-val, 0, val],
            ]
        )

    @staticmethod
    def apply_threshold(lines, th=50):
        mask_lines_bin = lines.copy()
        mask_idx = mask_lines_bin < th
        mask_lines_bin[mask_idx] = 1
        mask_lines_bin[~mask_idx] = 0
        return mask_lines_bin

    def img2edges(self, img):
        vertical_edges = signal.correlate(img, self.my_filter, method="fft")
        horizontal_edges = signal.correlate(img, self.my_filter.T, method="fft")
        edges = np.sqrt(vertical_edges**2 + horizontal_edges**2)
        edges_scaled = (255 / np.max(edges)) * edges
        mask_edges = self.apply_threshold(edges_scaled, th=self.th)
        return mask_edges


class GradientImage:
    def __init__(self, dx_pixels=6, dy_pixels=6):
        self.pixels_shift_up = dy_pixels
        self.pixels_shift_down = dy_pixels
        self.pixels_shift_left = dx_pixels
        self.pixels_shift_right = dx_pixels

    def get_grads(self, img):
        return (
            self.shift_frame_up(img),
            self.shift_frame_down(img),
            self.shift_frame_left(img),
            self.shift_frame_right(img),
        )

    def shift_frame_up(self, img):
        return np.array(
            np.vstack((img[self.pixels_shift_up :, :], img[-self.pixels_shift_up :, :])), dtype=int
        )

    def shift_frame_down(self, img):
        return np.array(
            np.vstack((img[: self.pixels_shift_down, :], img[: -self.pixels_shift_down, :])),
            dtype=int,
        )

    def shift_frame_left(self, img):
        return np.array(
            np.hstack((img[:, self.pixels_shift_left :], img[:, -self.pixels_shift_left :])),
            dtype=int,
        )

    def shift_frame_right(self, img):
        return np.array(
            np.hstack((img[:, : self.pixels_shift_right], img[:, : -self.pixels_shift_right])),
            dtype=int,
        )

    def get_frame_diff(self, shift_fun, img):
        frame_diff = shift_fun(img) - img
        frame_diff[frame_diff < 0] = 0
        return np.mean(frame_diff, axis=2, dtype=int)

    def get_frame_directions_diff(self, img):
        return (
            self.get_frame_diff(self.shift_frame_up, img),
            self.get_frame_diff(self.shift_frame_down, img),
            self.get_frame_diff(self.shift_frame_left, img),
            self.get_frame_diff(self.shift_frame_right, img),
        )

    @staticmethod
    def multiply_diffs(img1, img2):
        return np.sqrt(np.abs(np.multiply(img1, img2)))

    @staticmethod
    def apply_threshold(lines, th=50):
        mask_lines_bin = lines.copy()
        mask_idx = mask_lines_bin < th
        mask_lines_bin[mask_idx] = 1
        mask_lines_bin[~mask_idx] = 0
        return mask_lines_bin
