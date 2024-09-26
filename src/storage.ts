import { StorageClient } from '@supabase/storage-js'

const STORAGE_URL = 'https://fldpwjgfpmwbtlptuefj.supabase.co/storage/v1'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZHB3amdmcG13YnRscHR1ZWZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzMxOTYwNywiZXhwIjoyMDQyODk1NjA3fQ.zqWKxkJ7FHRwrjqHsnWKJUOAY8hZwXQFZVc7HftmVGM' //! service key, not anon key

export const storageClient = new StorageClient(STORAGE_URL, {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
})