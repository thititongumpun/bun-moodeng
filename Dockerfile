FROM oven/bun:alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    gcc \
    g++ \
    make \
    python3

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