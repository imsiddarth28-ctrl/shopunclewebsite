import { MongoClient, Db, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopuncle'
const dbName = process.env.MONGODB_DB || 'shopuncle'

// Extend the global type in TypeScript to persist the connection
declare global {
  var _mongoClient: MongoClient | undefined
  var _mongoDb: Db | undefined
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (global._mongoClient && global._mongoDb) {
    return { client: global._mongoClient, db: global._mongoDb }
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  
  global._mongoClient = client
  global._mongoDb = db
  
  return { client, db }
}

export async function getDb(): Promise<Db> {
  if (!global._mongoDb) {
    const { db } = await connectToDatabase()
    return db
  }
  return global._mongoDb
}

export function getObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export function serializeDoc<T>(doc: any): T {
  if (!doc) return doc
  const serialized = { ...doc }
  if (serialized._id) {
    serialized.id = serialized._id.toString()
    delete serialized._id
  }
  return serialized
}

export function serializeDocs<T>(docs: any[]): T[] {
  return docs.map(doc => serializeDoc(doc)) as T[]
}