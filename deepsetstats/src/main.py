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

config = Config(version="v1")
