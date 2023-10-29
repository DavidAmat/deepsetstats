"""
Dataset small in Docker container
- mkdir /tmp/dss
- cd /usr/src/app/images/all/zip
- unzip train_small.zip -d /tmp/dss/train_small
- unzip test_small.zip -d /tmp/dss/test_small
- cd ..
- cp -r annotations/ /tmp/dss
- ls -> annotations  test_small  train_small
"""

from deepsetstats.src.utils.inputs import Config
from deepsetstats.src.data.annotations import AnnotationsReader

config = Config(version="v1")

# Read annotations
annot_reader = AnnotationsReader(path_annotations=config.path_annotations)
annot = annot_reader.annotations

# Dummy
print(len(annot))
