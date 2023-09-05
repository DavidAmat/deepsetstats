FROM python:3.9-slim

# Basic hardening
# Apply latest security updates
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create an application user
RUN groupadd -g 1000 app && \
    useradd -M \
    -d /app \
    -c 'Application user' \
    -u 1000 \
    -g 1000 \
    --system \
    -s /sbin/nologin \
    app

# Python path to execute the estimators
ENV PYTHONPATH=/usr/src/app

# Install all dependencies, cmake and git needed for h3 - Put all the execution
# In one layer
RUN apt-get update && apt-get -y install cmake git build-essential curl \
    autoconf automake libtool python-dev-is-python3 pkg-config python3-tk tk libsasl2-dev&& \
    # Add update for pip to have the latest package DB
    python -m pip install --upgrade pip

RUN apt-get install -y ffmpeg

# Add Poetry install
RUN curl -sSL https://install.python-poetry.org | python3 -

# Add poetry install into the path to use it
ENV PATH="/root/.local/bin:${PATH}"

# Setup the Execution Dir and Estimator name
WORKDIR /usr/src/app

# Label used into clean_up_all_environment function on docker tools for clean
# the environment
LABEL remove_during_workspace_clean="true"

ARG estimator

