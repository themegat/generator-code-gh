# File: Dockerfile
#FROM ubuntu:22.04
FROM catthehacker/ubuntu:act-latest

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Intall ubuntu dependencies
RUN apt-get update && \
    apt-get install -y \
        ca-certificates \
        curl \
        git \
        libatk1.0-0 \
        libgtk-3-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libxcomposite1 \
        libxrandr2 \
        libxdamage1 \
        libpango-1.0-0 \
        libnss3 \
        libxshmfence1 \
        libgbm-dev \
        libasound2 \
        libdrm-amdgpu1 \
        libdrm-intel1 \
        libdrm-nouveau2 \
        libdrm-radeon1 \
        libfontenc1 \
        libgl1-amber-dri \
        libgl1-mesa-dri \
        libglapi-mesa \
        libglvnd0 \
        libglx0 \
        libllvm15 \
        libpciaccess0 \
        libsensors-config \
        libsensors5 \
        libx11-xcb1 \
        libxaw7 \
        libxcb-dri2-0 \
        libxcb-dri3-0 \
        libxcb-glx0 \
        libxcb-present0 \
        libxcb-sync1 \
        libxcb-xfixes0 \
        libxfont2 \
        libxkbfile1 \
        libxmu6 \
        libxmuu1 \
        libxpm4 \
        libxxf86vm1 \
        x11-xkb-utils \
        xauth \
        xfonts-base \
        xfonts-encodings \
        xfonts-utils \
        xserver-common \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js (v22 to match your "@types/node": "22.x")
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /app

COPY package.json ./
COPY ./.docker/scripts/vscode_downloader.js ./.docker/scripts/

# Install dependencies
RUN {pkgManager} install

# Download VS Code for testing
RUN {pkgManager} run vscode:download