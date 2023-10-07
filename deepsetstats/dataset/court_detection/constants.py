THRES_BC_HIGH_CONF = 0.3
THRES_BC_LOW_CONF = 0.5


# ------------------------------------------------- #
# ------------------------------------------------- #
#      Template matching
# ------------------------------------------------- #
# ------------------------------------------------- #
# 1. Fractions of image patching
fs = [
    # frac_x_start, frac_x_end, frac_y_start,
    (1. / 7, 1. / 2, 1. / 7, 1. / 2),
    (1. / 2, 6. / 7, 1. / 7, 1. / 2),
    (1. / 7, 1. / 2, 1. / 2, 6. / 7),
    (1. / 2, 6. / 7, 1. / 2, 6. / 7),
]

# 2. Batch size of frames to load with threading in template_matching.py
# when loading frames to compare with the reference court to assess similarity
BATCH_SIZE_TEMPLATE_MATCHING = 20
