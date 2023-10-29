import yaml
from easydict import EasyDict as edict
from pathlib import Path
from deepsetstats.paths import PATH_CONFIG


class Config:
    def __init__(self, version):
        # Read config file
        self.version = version
        conf = self.get_config_from_yaml(version=self.version)
        paths = conf.get("paths")

        # Create dynamic paths as we read them from the YAML
        for path_name, d_path_config in paths.items():
            path = Path(d_path_config["path"])
            path_attribute = f"path_{path_name}"
            setattr(self, path_attribute, path)

            for dir_name in d_path_config.get("dirs", []):
                dir_path = path / dir_name
                dir_attribute = f"path_{dir_name}"
                setattr(self, dir_attribute, dir_path)

    @staticmethod
    def get_config_from_yaml(version, yaml_file=PATH_CONFIG):
        """
        Get the config from deepsetstats/src/config/config.yaml
        Input:
            - yaml_file: yaml configuration file
        Return:
            - config: namespace
            - config_dict: dictionary
        """
        yaml_file = yaml_file.format(version=version)
        with open(yaml_file) as fp:
            config_dict = yaml.load(fp, Loader=yaml.FullLoader)

        # convert the dictionary to a namespace using bunch lib
        config = edict(config_dict)
        return config


if __name__ == "__main__":
    config = Config(version="v1")
    print(config)
