import cv2
import numpy as np
from matplotlib import pyplot as plt


class Visualizer:
    def __init__(self) -> None:
        pass

    @staticmethod
    def show_lab(colors):
        sh = colors.shape
        if len(sh) < 3:
            colors = colors.reshape(1, -1, 3)
        assert sh[-1] == 3, "Last dimension should be 3 channels"
        colors = cv2.cvtColor(np.uint8(colors), cv2.COLOR_LAB2RGB)
        return Visualizer.show_rgb(colors.reshape(-1, 3))

    @staticmethod
    def show_rgb(colors):
        size = (3, 3, 3)
        len_colors = len(colors)
        plt.figure(figsize=(len_colors, 3))
        for pos, color in enumerate(colors):

            # sample squares for example
            square = np.full(size, fill_value=color, dtype=np.uint8) / 255.0
            plt.subplot(1, len_colors, pos + 1)
            plt.axis("off")
            plt.imshow(square)
        plt.tight_layout(pad=0)
        plt.show()

    @staticmethod
    def display_hue(img_hsv):
        plt.figure(num=None, figsize=(8, 6), dpi=80)
        plt.imshow(img_hsv[:, :, 0], cmap="hsv")
        plt.colorbar()

    @staticmethod
    def putText(img, pos, text):
        fontScale = 2
        fontColor = (0, 0, 0)
        thickness = 1
        lineType = 1

        cv2.putText(
            img,
            text,
            pos,
            cv2.FONT_HERSHEY_PLAIN,
            fontScale,
            fontColor,
            thickness,
            lineType,
        )
        return img

    @staticmethod
    def display_as_hsv(img):

        img_hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)

        hsv_list = ["Hue", "Saturation", "Value"]
        fig, ax = plt.subplots(1, 3, figsize=(15, 7), sharey=True)

        ax[0].imshow(img_hsv[:, :, 0], cmap="hsv")
        ax[0].set_title(hsv_list[0], fontsize=20)
        ax[0].axis("off")

        ax[1].imshow(img_hsv[:, :, 1], cmap="Greys")
        ax[1].set_title(hsv_list[1], fontsize=20)
        ax[1].axis("off")

        ax[2].imshow(img_hsv[:, :, 2], cmap="gray")
        ax[2].set_title(hsv_list[2], fontsize=20)
        ax[2].axis("off")

        fig.tight_layout()

    @staticmethod
    def show_frame(frame_rgb):
        plt.imshow(frame_rgb)
        plt.show()

    @staticmethod
    def visualize_grid(frame, x_vlines, y_hlines, color_grid=(0, 0, 0)):
        # Visualize strategy
        frame_viz = frame.copy()
        for xx in x_vlines:
            cv2.line(frame_viz, (xx, min(y_hlines)), (xx, max(y_hlines)), color_grid, 2)
        for yy in y_hlines:
            cv2.line(frame_viz, (min(x_vlines), yy), (max(x_vlines), yy), color_grid, 2)
        Visualizer.show_frame(frame_viz)

    @staticmethod
    def draw_line_points(frame, l_xy_lines):
        plot_frame = frame.copy()
        for tup_xy in l_xy_lines:
            cv2.circle(plot_frame, tup_xy, 1, (50, 50, 50), 10)
        return plot_frame

    @staticmethod
    def putText2(img, pos, text):
        fontScale = 2
        fontColor = (0, 0, 0)
        thickness = 1
        lineType = 1

        cv2.putText(
            img,
            text,
            pos,
            cv2.FONT_HERSHEY_PLAIN,
            fontScale,
            fontColor,
            thickness,
            lineType,
        )
        return img
