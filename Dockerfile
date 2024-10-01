FROM oven/bun:debian AS build

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libc6-dev \
    libvips-dev \
    gcc \
    g++ \
    make \
    python3 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Cache packages installation
COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install
# RUN bun install sharp --os=linux --cpu=x64

COPY ./src ./src

ARG STORAGE_URL
ARG SERVICE_KEY

ENV STORAGE_URL=${STORAGE_URL}
ENV SERVICE_KEY=${SERVICE_KEY}
ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000