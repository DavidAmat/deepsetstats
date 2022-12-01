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
            colors = colors[None, ...]
        assert sh[-1] == 3, "Last dimension should be 3 channels"
        colors = cv2.cvtColor(colors, cv2.COLOR_LAB2RGB)
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
