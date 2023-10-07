import numpy as np
from scipy import signal

import deepsetstats.utils.constants as c
from deepsetstats.utils.utils_dataclasses import ConfigGrid, ConfigHist


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
        return np.array(1 - mask_edges, dtype=np.uint8)

    @staticmethod
    def create_sequence(margin, end, num_slices, shifted=False):
        # If shifted: use the half of the margin to shift grid right
        if not shifted:
            return np.linspace(margin, end - margin, num_slices, dtype=np.int16)
        else:
            return np.linspace(
                margin // 2, end - margin - margin // 2, num_slices, dtype=np.int16
            )

    @staticmethod
    def create_grid(
        slices_xy=(17, 17), marg_xy=(20, 20), frame_shape_hw=(720, 1280), shifted=False
    ):
        assert slices_xy[0] > 1
        assert slices_xy[1] > 1

        # Vertical Lines (fixed X): Take margin of X and total width
        x_vlines = EdgeDetect.create_sequence(
            marg_xy[0], frame_shape_hw[1], slices_xy[0], shifted=shifted
        )
        x_diff = x_vlines[1] - x_vlines[0]

        # Horizontal Lines (fixed Y): Take margin of Y and total height
        y_hlines = EdgeDetect.create_sequence(
            marg_xy[1], frame_shape_hw[0], slices_xy[1], shifted=shifted
        )
        y_diff = y_hlines[1] - y_hlines[0]

        return x_vlines, y_hlines, x_diff, y_diff

    @staticmethod
    def get_grid_crop(frame, row, col, xx, yy, x_diff, y_diff):
        # xx, yy: come from the meshgrid of the x_vlines and y_hlines
        xv = xx[row][col]
        yv = yy[row][col]
        return frame[yv : yv + y_diff, xv : xv + x_diff]

    @staticmethod
    def correct_mask(mask, row, col, xx, yy, x_diff, y_diff):
        xv = xx[row][col]
        yv = yy[row][col]
        mask[yv : yv + y_diff + 1, xv : xv + x_diff + 1] = 0
        return mask

    @staticmethod
    def correct_margins(mask, marg_xy=(1, 1)):
        margx = marg_xy[0]
        margy = marg_xy[1]
        mask[:, :margx] = 0
        mask[:, -margx:] = 0
        mask[:margy, :] = 0
        mask[-margy:, :] = 0
        return mask

    @staticmethod
    def get_ones_line_mask(line):
        where_1s = np.where(line)[0]
        return where_1s

    @staticmethod
    def get_ones_shift_diff(where_1s):
        # Get differences in indexes of 1s (consecutive indexes should be 0 diff, this is why -1)
        diff_position = np.ediff1d(where_1s) - 1

        # Mark with -1 the last position of the line
        diff_position = np.append(diff_position, -1)
        return diff_position

    @staticmethod
    def get_lines_from_mask(where_1s, diff_position, len_line):
        lines = []
        current_line = []
        for idx_where in range(len(diff_position)):
            pos_1 = where_1s[idx_where]
            diffpos_1 = diff_position[idx_where]

            if diffpos_1 == -1:
                # How many zeros are left
                if len_line - pos_1 - 1 >= 3:
                    current_line.append(pos_1)
                    if len(current_line) >= 2:
                        lines.append(current_line)
                    current_line = []

            # Consider as the same line
            elif diffpos_1 <= 1:
                current_line.append(pos_1)

            # Split to a new line
            elif diffpos_1 >= 10:
                current_line.append(pos_1)
                if len(current_line) >= 2:
                    lines.append(current_line)
                current_line = []
            else:
                if len(current_line) >= 2:
                    current_line.append(pos_1)
                    lines.append(current_line)
                    current_line = []
                else:
                    current_line = []
        # Filter only lines less than length 6
        lines = [line for line in lines if len(line) < 11]
        return lines

    @staticmethod
    def get_idx_line_center(line):
        return int(np.ceil(np.mean(line)))

    @staticmethod
    def get_coordinates_lines(edges, grid_lines, is_vertical=True):
        d_lines = {}
        d_xy_lines = {}
        # ------------------------------------- #
        #     Vertical shift
        # ------------------------------------- #
        for idx, pos_fix in enumerate(grid_lines):

            if is_vertical:
                # [VERTICAL SLICE] Get 0/1 of the line
                line = np.abs(edges[:, pos_fix : pos_fix + 1]).ravel()
            else:
                # [HORIZONTAL SLICE] Get 0/1 of the line
                line = np.abs(edges[pos_fix : pos_fix + 1, :]).ravel()

            # Find places where the line is max intensity pixel (1)
            where_1s = EdgeDetect.get_ones_line_mask(line)
            if not len(where_1s):
                continue

            # Find the differences between the consecutive places of 1s
            diff_position = EdgeDetect.get_ones_shift_diff(where_1s)

            # Decide if those differences correspond to a line or an artifact
            len_line = len(line)
            lines = EdgeDetect.get_lines_from_mask(where_1s, diff_position, len_line)

            # Get the possible center of that line
            l_idx_line_center = [EdgeDetect.get_idx_line_center(line) for line in lines]
            # l_len_line = [len(line) for line in lines]

            # Save results
            d_lines[idx] = lines
            if is_vertical:
                d_xy_lines[idx] = [(idx_var, pos_fix) for idx_var in l_idx_line_center]
            else:
                d_xy_lines[idx] = [(pos_fix, idx_var) for idx_var in l_idx_line_center]
        return d_xy_lines

    @staticmethod
    def collect_xy_lines(l_dicts_xy):
        l_xy_lines = []
        for d_iter in l_dicts_xy:
            for _, l_tup_xy in d_iter.items():
                for tup_xy in l_tup_xy:
                    y1, x1 = tup_xy
                    l_xy_lines.append((x1, y1))
        return l_xy_lines

    @staticmethod
    def get_corrected_mask(
        frame_lab, mask_edges, court_type, cfg_hist: ConfigHist, cfg_grid: ConfigGrid
    ):
        mask_edges_corrected = mask_edges.copy()
        mask_edges_corrected = EdgeDetect.correct_margins(
            mask_edges_corrected, cfg_grid.marg_xy
        )
        threshold_lab_diff = c.LAB_TH[court_type]
        threshold_lab_diff = 10
        for row in range(cfg_grid.slices_xy[0]):
            for col in range(cfg_grid.slices_xy[1]):
                crop = EdgeDetect.get_grid_crop(
                    frame_lab,
                    row,
                    col,
                    cfg_grid.xx,
                    cfg_grid.yy,
                    cfg_grid.x_diff,
                    cfg_grid.y_diff,
                )

                # Get the median color on that crop
                median_lab_crop = np.median(crop.reshape(-1, 3), axis=0)

                # Compare the mean of that square with the top colors of the court
                color_diff_top_lab = np.mean(
                    np.abs(np.subtract(median_lab_crop, cfg_hist.top_lab)), axis=1
                )
                min_color_diff_top_lab = np.min(color_diff_top_lab)
                if min_color_diff_top_lab > threshold_lab_diff:
                    mask_edges_corrected = EdgeDetect.correct_mask(
                        mask_edges_corrected,
                        row,
                        col,
                        cfg_grid.xx,
                        cfg_grid.yy,
                        cfg_grid.x_diff,
                        cfg_grid.y_diff,
                    )
        return mask_edges_corrected


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
            np.vstack(
                (img[self.pixels_shift_up :, :], img[-self.pixels_shift_up :, :])
            ),
            dtype=int,
        )

    def shift_frame_down(self, img):
        return np.array(
            np.vstack(
                (img[: self.pixels_shift_down, :], img[: -self.pixels_shift_down, :])
            ),
            dtype=int,
        )

    def shift_frame_left(self, img):
        return np.array(
            np.hstack(
                (img[:, self.pixels_shift_left :], img[:, -self.pixels_shift_left :])
            ),
            dtype=int,
        )

    def shift_frame_right(self, img):
        return np.array(
            np.hstack(
                (img[:, : self.pixels_shift_right], img[:, : -self.pixels_shift_right])
            ),
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
