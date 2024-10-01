import { Elysia, t } from "elysia";
import { storageClient } from "./storage";
import { swagger } from '@elysiajs/swagger'
import { Meme } from "./types/meme";
import cors from "@elysiajs/cors";
import { logger } from "@tqman/nice-logger";
import cloudinary from "./cloudinary";

const bucket = 'memes_bucket'

export const app = new Elysia()
  .use(swagger())
  .use(logger({
    mode: "combined",
    enabled: true
  }))
  .use(cors({
    origin: ['http://localhost:5173', 'https://wcydtt.co', 'https://www.wcydtt.co'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .get("/", () => "Hello Elysia")
  .get("/list", async ({ query }) => {
    const { data } = await storageClient.from(bucket).list(query.folder, {
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
      sortBy: { column: query.column ?? 'name', order: query.order ?? 'asc' },
    })
    return data
  }, {
    query: t.Object({
      folder: t.Optional(t.String()),
      limit: t.Optional(t.Numeric()),
      offset: t.Optional(t.Numeric()),
      column: t.Optional(t.String()),
      order: t.Optional(t.String()),
    })
  })
  .get("/memes", async ({ query }) => {
    const publicUrls: Meme[] = [];
    const { data, error } = await storageClient.from(bucket).list(query.folder ?? "video", {
      limit: query.limit ?? 8,
      offset: query.offset ?? 0,
      sortBy: { column: 'created_at', order: 'desc' },
      search: query.search ?? undefined
    })
    if (!error) {
      for (const item of data) {
        const { data } = await storageClient.from(bucket).getPublicUrl(`${query.folder ?? "video"}/${item.name}`)
        publicUrls.push({
          name: item.name,
          url: data.publicUrl
        })
      }
    }

    return publicUrls
  }, {
    query: t.Object({
      folder: t.Optional(t.String()),
      limit: t.Optional(t.Numeric()),
      offset: t.Optional(t.Numeric()),
      search: t.Optional(t.String()),
    })
  })
  .post("/upload", async ({ body }) => {
    const { name, type } = body.file
    if (type.startsWith('image')) {
      const arrayBuffer = await body.file.arrayBuffer()
      const inputStream = Buffer.from(arrayBuffer)

      const result = await cloudinary.uploader.upload(`data:image/webp;base64,${inputStream.toString('base64')}`, {
        folder: 'wcydtt',
        public_id: name,
        transformation: { crop: 'scale' },
        fetch_format: 'webp',
      });

      const response = await fetch(result.secure_url);
      const imageBuffer = await response.arrayBuffer();

      const { data, error } = await storageClient.from(bucket).upload(`images/${name}`, imageBuffer, {
        contentType: 'image/webp'
      })

      if (error) {
        throw new Error(`Error uploading image to Supabase: ${error.message}`);
      }

      return {
        url: data?.fullPath
      }
    }

    const { data, error } = await storageClient.from(bucket).upload(`video/${name}`, body.file)
    if (error) throw error
    return {
      url: data?.fullPath
    }
  }, {
    body: t.Object({
      file: t.File()
    })
  })
  .listen(3000);

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);