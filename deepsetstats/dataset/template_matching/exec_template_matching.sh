#!/bin/bash

# Add permisions of exec to this file
# chmod +x exec_template_matching.sh

# Specify the range of tournament IDs (from 0 to 65)
for tournament_id in {0..2}; do
    # Run the Python script with the current tournament_id using nohup
    nohup python template_matching.py --tournament_id "$tournament_id" &
    #nohup python toy.py --tournament_id "$tournament_id" > /dev/stdout 2>&1 &
    #python template_matching.py --tournament_id "$tournament_id"

    # Wait for the previous command to finish before starting the next one
    wait
done

# All scripts have finished running sequentially
echo "All scripts have completed."
