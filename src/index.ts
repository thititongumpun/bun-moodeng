import { Elysia, t } from "elysia";
import { storageClient } from "./storage";
import { swagger } from '@elysiajs/swagger'

const bucket = 'memes_bucket'

export const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get("/storage", async () => {
    const { data } = await storageClient.from(bucket).getPublicUrl('video/PigTweak.mp4')
    return data.publicUrl
  })
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
  .get("/memes", async () => {
    const publicUrls = [];
    const { data, error } = await storageClient.from(bucket).list('video')
    if (!error) {
      for (const item of data) {
        const { data } = await storageClient.from(bucket).getPublicUrl(`video/${item.name}`)
        publicUrls.push(data.publicUrl)
      }
    }

    return publicUrls
  })
  .post("/upload", async ({ body }) => {
    const { name, type } = body.file
    if (type.startsWith('image')) {
      const { data, error } = await storageClient.from(bucket).upload(`images/${name}`, body.file)
      if (error) throw error
      return data?.fullPath
    }
    const { data, error } = await storageClient.from(bucket).upload(`video/${name}`, body.file)
    if (error) throw error
    return data?.fullPath
  }, {
    body: t.Object({
      file: t.File()
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);