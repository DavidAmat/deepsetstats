import yaml
from easydict import EasyDict as edict

from deepsetstats.paths import PATH_CONFIG


def get_config_from_yaml(yaml_file=PATH_CONFIG):
    """
    Get the config from deepsetstats/src/config/config.yaml
    Input:
        - yaml_file: yaml configuration file
    Return:
        - config: namespace
        - config_dict: dictionary
    """

    with open(yaml_file) as fp:
        config_dict = yaml.load(fp, Loader=yaml.FullLoader)

    # convert the dictionary to a namespace using bunch lib
    config = edict(config_dict)
    return config


if __name__ == "__main__":
    configs = get_config_from_yaml()
