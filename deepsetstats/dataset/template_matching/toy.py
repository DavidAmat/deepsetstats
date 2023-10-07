import time
import argparse
import tqdm

# Parse argument of tournament_id
parser = argparse.ArgumentParser(description='Process tournament ID.')
parser.add_argument('--tournament_id', type=int, help='The tournament ID as an integer.')
args = parser.parse_args()
tournament_id = int(args.tournament_id)
print("Tournament ID:", tournament_id)

for _ in tqdm.tqdm(range(10)):
    time.sleep(2)
