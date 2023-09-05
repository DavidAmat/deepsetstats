FROM pytorch/pytorch:latest

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Add Poetry install
RUN curl -sSL https://install.python-poetry.org | python3 -

# Python path to execute the estimators
ENV PYTHONPATH=/usr/src/app

# Add poetry install into the path to use it
ENV PATH="/root/.local/bin:${PATH}"

# Setup the Execution Dir and Estimator name
WORKDIR /usr/src/app

