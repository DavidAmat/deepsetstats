import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Tuple, Dict, List, Union
import re
from pydantic import BaseModel
from collections import defaultdict
from os.path import splitext


class XMLBox(BaseModel):
    label: str
    occluded: bool
    bbox: List[List]


class XMLCourt(BaseModel):
    label: str
    point_labels: List[int]
    point_occlusions: List[bool]
    point_kps: List[Tuple[float, float]]


class AnnotationSet(BaseModel):
    image_id: int
    image_name: str
    is_court: bool
    tourn_id: int
    video_id: str
    interval_id: int
    frame_num: int
    net: XMLBox
    score: XMLBox
    player1: XMLBox
    player2: XMLBox
    court: XMLCourt


class Annotations:
    def __init__(self, path_annotations: Path) -> None:
        self.path_annotations = path_annotations
        self.files_path_annotations = [filename for filename in path_annotations.iterdir() if filename.is_file() and filename.suffix == ".xml"]
        self.l_tour_ids = [self.parse_tournament_annotation_file(str(path_xml.name)) for path_xml in self.files_path_annotations]

        # Create the list of annotation sets
        self.l_annot_sets = [
            self.read_annotations(tournament_id=tournament_id)
            for tournament_id in self.l_tour_ids
        ]

        # Dictionary of annotations with image_name being the unique key
        self.annotations = {image_name: annot_set for d_annot_set in self.l_annot_sets for image_name, annot_set in d_annot_set.items()}

    @staticmethod
    def get_box_xml(xml_element: ET.Element, label: str) -> XMLBox:
        # Extract net bbox
        box_xml = xml_element.find(f'.//box[@label="{label}"]')
        d_box = {}
        box_coords = lambda x, y: (float(box_xml.get(x, 0)), float(box_xml.get(y, 0)))  # noqa
        return XMLBox(
            label=label,
            occluded=True if int(d_box.get("occluded", 1)) == 1 else False,
            bbox=[box_coords("xtl", "ytl"), box_coords("xbr", "ybr")]
        )

    @staticmethod
    def get_skeleton_xml(xml_element: ET.Element, label: str):
        # Get the property skeleton with label court
        skeleton_court = xml_element.find(f'.//skeleton[@label="{label}"]')

        # Iterate through all keypoints of that image
        l_points = [point.items() for point in skeleton_court]
        # l_points = [ [('label', '1'), ('source', 'manual'), ('outside', '0'), ('occluded', '0'), ('points', '288.52,797.47')], ...]

        # Extracting data for all points in the points section
        d_points = defaultdict(list)
        for l_point in l_points:
            for key, value in l_point:
                if key in ["points"]:
                    # Converts ('points', '288.52,797.47')
                    keypoint_xy = tuple(map(float, value.split(',')))
                    d_points[key].append(keypoint_xy)

                elif key in ["label", "occluded"]:
                    # Converts ('label', '1'), ('occluded', '0')
                    # Both label and occluded are integers
                    d_points[key].append(int(value))
        return XMLCourt(
            label=label,
            point_labels=d_points["label"],
            point_occlusions=d_points["occluded"],
            point_kps=d_points["points"],
        )
   
    @staticmethod
    def parse_img_name(image_name) -> Tuple[bool, int, str, int, int]:
        pattern = r'(court|nocourt)___t(.*?)___v(.*?)___i(.*?)___f(.*?).png'
        # nocourt___t62___vz8H3tZLOsmE___i0___f3935.png
        match = re.search(pattern, image_name)

        if match:
            is_court = True if match.group(1) == "court" else False
            tourn_id = match.group(2)
            video_id = match.group(3)
            interval_id = match.group(4)
            frame_num = match.group(5)
            return is_court, int(tourn_id), video_id, int(interval_id), int(frame_num)
        else:
            return None, None, None, None, None
        
    @staticmethod
    def parse_tournament_annotation_file(annotation_file) -> Union[int, None]:
        pattern = r't(.*?).xml'
        match = re.search(pattern, annotation_file)
        if match:
            tournament_id = int(match.group(1))
        else:
            tournament_id = None
        return tournament_id
    
    def read_annotations(self, tournament_id: int) -> Dict[str, AnnotationSet]:
        # Convert from tournament_id to path:
        file_tournament = f't{tournament_id}.xml'
        path_annotations_file = self.path_annotations / file_tournament

        tree = ET.parse(path_annotations_file)
        root = tree.getroot()
        
        # Return dict of type Dict[str, AnnotationSet]
        d_tournament_anot: Dict[str, AnnotationSet] = {}

        # Iterate through each 'image' element in the XML
        for xml_image in root.findall('.//image'):
            # Extract image id and name
            image_id = xml_image.get('id')
            image_name = xml_image.get('name')

            # Parse properties of the name
            is_court, tourn_id, video_id, interval_id, frame_num = self.parse_img_name(image_name=image_name)

            # --------------------------------------- #
            #     Get xml info
            # --------------------------------------- #
            # Court keypoints
            xml_court: XMLCourt = self.get_skeleton_xml(xml_element=xml_image, label="court")

            # Net, score, player 1 and player 2 bounding boxes
            xml_net: XMLBox = self.get_box_xml(xml_element=xml_image, label="net")
            xml_score: XMLBox = self.get_box_xml(xml_element=xml_image, label="score")
            xml_player1: XMLBox = self.get_box_xml(xml_element=xml_image, label="player_1")
            xml_player2: XMLBox = self.get_box_xml(xml_element=xml_image, label="player_2")

            # Create this data point as an instance of a pydantic AnnotationsSet class
            image_name_noext = splitext(image_name)[0]
            d_tournament_anot[image_name_noext] = AnnotationSet(
                image_id=image_id,
                image_name=image_name,
                is_court=is_court,
                tourn_id=tourn_id,
                video_id=video_id,
                interval_id=interval_id,
                frame_num=frame_num,
                net=xml_net,
                score=xml_score,
                player1=xml_player1,
                player2=xml_player2,
                court=xml_court,
            )

        return d_tournament_anot


if __name__ == "__main__":
    from deepsetstats.src.utils.inputs import Config
    import time
    config = Config(version="v1")
    
    t1 = time.time()
    annot = Annotations(path_annotations=config.path_annotations)
    t2 = time.time()
    latency = t2 - t1
    # args = annot.parse_img_name("court___t62___vH6GSW-PNOg8___i0___f11253.png")
    # d_sample = annot.read_annotations(tournament_id=63)
