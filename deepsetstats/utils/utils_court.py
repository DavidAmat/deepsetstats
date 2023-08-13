import numpy as np

from deepsetstats.utils import constants as c
from deepsetstats.utils.utils_colors import Colors


class Court:
    @staticmethod
    def get_ones_line_mask(line):
        where_1s = np.where(line)[0]
        return where_1s

    @staticmethod
    def get_court_type(frame_lab):
        center = np.array(frame_lab.shape) / 2
        size_crop = 300
        x = center[1] - size_crop / 2
        y = center[0] - size_crop / 2
        crop_frame = frame_lab[int(y) : int(y + size_crop), int(x) : int(x + size_crop)]
        mean_lab_crop = np.mean(np.mean(crop_frame, axis=0), axis=0)
        lab_court_types = Colors.frame2lab(c.RGB_COURTS)
        distance_crop2types = np.mean(np.abs(mean_lab_crop - lab_court_types), axis=1)
        COURT_TYPE = c.LIST_COURTS[np.argmin(distance_crop2types)]
        return COURT_TYPE, mean_lab_crop

    @staticmethod
    def get_ones_shift_diff(where_1s):
        # Get differences in indexes of 1s (consecutive indexes should be 0 diff, this is why -1)
        diff_position = np.ediff1d(where_1s) - 1

        # Mark with -1 the last position of the line
        diff_position = np.append(diff_position, -1)
        return diff_position

    @staticmethod
    def get_idx_line_center(line):
        return int(np.ceil(np.mean(line)))

    @staticmethod
    def get_line_width(line):
        return len(line)

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
            elif diffpos_1 >= 20:
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
        lines = [line for line in lines if Court.get_line_width(line) < 11]
        return lines

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
                line = np.abs(edges[:, pos_fix : pos_fix + 1] - 1).ravel()
            else:
                # [HORIZONTAL SLICE] Get 0/1 of the line
                line = np.abs(edges[pos_fix : pos_fix + 1, :] - 1).ravel()

            # Find places where the line is max intensity pixel (1)
            where_1s = Court.get_ones_line_mask(line)

            # Find the differences between the consecutive places of 1s
            diff_position = Court.get_ones_shift_diff(where_1s)

            # Decide if those differences correspond to a line or an artifact
            lines = Court.get_lines_from_mask(where_1s, diff_position)

            # Get the possible center of that line
            l_idx_line_center = [Court.get_idx_line_center(line) for line in lines]
            # l_len_line = [Court.get_line_width(line) for line in lines]

            # Save results
            d_lines[idx] = lines
            if is_vertical:
                d_xy_lines[idx] = [(idx_var, pos_fix) for idx_var in l_idx_line_center]
            else:
                d_xy_lines[idx] = [(pos_fix, idx_var) for idx_var in l_idx_line_center]
        return d_xy_lines
