from torch.utils.data import Dataset
from typing import Tuple


class DSSDataset(Dataset):
    def __init__(self, path_images, path_labels, mode: str, img_size: Tuple = (720, 1280)):
        # Paths from Config
        self.path_images = path_images
        self.path_labels = path_labels

        # Inputs
        self.mode = mode
        assert mode in ['train', 'val'], 'incorrect mode'
        self.img_height, self.img_width = img_size
        super().__init__()


if __name__ == "__main__":
    import os
    os.system("clear")

    from deepsetstats.src.utils.inputs import Config
    config = Config(version="v1")
    dataset = DSSDataset(
        path_images=config.path_train_small,
        path_labels=config.path_annotations,
        mode="train",
    )
    print(dataset)
