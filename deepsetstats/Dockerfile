FROM pytorch/pytorch:latest

# Install system dependencies (if needed)
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libpq-dev \
        python3-dev \
        build-essential \
        wget \
        postgresql-client

# Add Poetry install
RUN curl -sSL https://install.python-poetry.org | python3 -

# Python path to execute the estimators
ENV PYTHONPATH=/usr/src/app

# Add poetry install into the path to use it
ENV PATH="/root/.local/bin:${PATH}"

# Install poetry
RUN pip install poetry
RUN pip install SQLAlchemy==1.4.22
# RUN cd /usr/src/app/deepsetstats && poetry config virtualenvs.create false && poetry install

# Setup the Execution Dir and Estimator name
WORKDIR /usr/src/app

