const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Load environment variables manually if .env exists
const envPath = path.join(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      process.env[key] = value.trim()
    }
  })
}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopuncle'
const dbName = process.env.MONGODB_DB || 'shopuncle'
const backupSecret = process.env.BACKUP_SECRET || process.env.NEXTAUTH_SECRET || 'shopuncle-default-backup-secret-key-123'

// Derive a 32-byte key from the secret
const encryptionKey = crypto.createHash('sha256').update(backupSecret).digest()

// Recursive helper to deserialize Extended JSON back to MongoDB types
function deserializeMongoTypes(val) {
  if (val === null || val === undefined) return val

  if (typeof val === 'object') {
    // Check if it is a serialized ObjectId
    if ('$oid' in val && Object.keys(val).length === 1) {
      return new ObjectId(val.$oid)
    }
    // Check if it is a serialized Date
    if ('$date' in val && Object.keys(val).length === 1) {
      return new Date(val.$date)
    }
    
    if (Array.isArray(val)) {
      return val.map(deserializeMongoTypes)
    }

    const res = {}
    for (const k in val) {
      res[k] = deserializeMongoTypes(val[k])
    }
    return res
  }
  return val
}

async function runRestore() {
  const backupDir = path.join(__dirname, '../backups')
  
  // Get the backup file from CLI args
  const args = process.argv.slice(2)
  let backupFile = args[0]

  if (!backupFile) {
    // If no argument is provided, find the most recent backup in the folder
    if (!fs.existsSync(backupDir)) {
      console.error('[Restore] No backups directory found.')
      process.exit(1)
    }
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.enc'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time)

    if (files.length === 0) {
      console.error('[Restore] No backup files (.enc) found in backups directory.')
      process.exit(1)
    }
    backupFile = files[0].name
    console.log(`[Restore] No file specified. Defaulting to the latest backup: ${backupFile}`)
  }

  const filepath = path.isAbsolute(backupFile) ? backupFile : path.join(backupDir, backupFile)
  
  if (!fs.existsSync(filepath)) {
    console.error(`[Restore] Backup file not found at: ${filepath}`)
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    console.log(`[Restore] Reading backup file...`)
    const rawPayload = JSON.parse(fs.readFileSync(filepath, 'utf8'))

    const iv = Buffer.from(rawPayload.iv, 'hex')
    const encryptedData = rawPayload.data

    console.log(`[Restore] Decrypting database payload...`)
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    const backupData = JSON.parse(decrypted)
    console.log(`[Restore] Connecting to database: ${uri} (DB: ${dbName})...`)
    await client.connect()
    const db = client.db(dbName)

    console.log(`[Restore] Beginning database restore from backup dated: ${backupData.exportedAt}`)

    for (const colName in backupData.collections) {
      console.log(`[Restore] Restoring collection: ${colName}...`)
      
      // Drop the existing collection first
      try {
        await db.collection(colName).drop()
        console.log(`[Restore] Dropped existing collection: ${colName}`)
      } catch (dropErr) {
        // Collection might not exist, which is fine
      }

      const docs = deserializeMongoTypes(backupData.collections[colName])

      if (docs && docs.length > 0) {
        await db.collection(colName).insertMany(docs)
        console.log(`[Restore] Inserted ${docs.length} documents into ${colName}`)
      } else {
        // Ensure the collection is created even if it was empty
        await db.createCollection(colName)
        console.log(`[Restore] Created empty collection: ${colName}`)
      }
    }

    console.log(`[Restore] Database restore completed successfully!`)

  } catch (error) {
    console.error('[Restore] Database restore failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

runRestore()
