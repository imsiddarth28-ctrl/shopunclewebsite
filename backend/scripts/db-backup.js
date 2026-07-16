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

// Recursive helper to serialize MongoDB types to Extended JSON
function serializeMongoTypes(val) {
  if (val === null || val === undefined) return val
  
  if (val instanceof ObjectId) {
    return { $oid: val.toString() }
  }
  if (val instanceof Date) {
    return { $date: val.toISOString() }
  }
  if (Array.isArray(val)) {
    return val.map(serializeMongoTypes)
  }
  if (typeof val === 'object') {
    const res = {}
    for (const k in val) {
      res[k] = serializeMongoTypes(val[k])
    }
    return res
  }
  return val
}

async function runBackup() {
  const client = new MongoClient(uri)
  const backupDir = path.join(__dirname, '../backups')

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  try {
    console.log(`[Backup] Connecting to MongoDB: ${uri}`)
    await client.connect()
    const db = client.db(dbName)

    console.log(`[Backup] Fetching collections...`)
    const collections = await db.listCollections().toArray()
    
    const backupData = {
      database: dbName,
      exportedAt: new Date().toISOString(),
      collections: {}
    }

    for (const colInfo of collections) {
      const colName = colInfo.name
      console.log(`[Backup] Exporting collection: ${colName}...`)
      const docs = await db.collection(colName).find({}).toArray()
      backupData.collections[colName] = serializeMongoTypes(docs)
    }

    // Convert backup data to string
    const jsonString = JSON.stringify(backupData)

    // Encrypt using AES-256-CBC
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
    let encrypted = cipher.update(jsonString, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Combine IV and Encrypted content
    const finalPayload = JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.enc`
    const filepath = path.join(backupDir, filename)

    fs.writeFileSync(filepath, finalPayload, 'utf8')
    console.log(`[Backup] Encrypted backup created successfully at: ${filepath}`)

    // Prune old backups (keep last 7)
    const files = fs.readdirSync(backupDir)
    const backupFiles = files
      .filter(f => f.startsWith('backup-') && f.endsWith('.enc'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time) // Newest first

    if (backupFiles.length > 7) {
      console.log(`[Backup] Pruning old backups...`)
      for (let i = 7; i < backupFiles.length; i++) {
        const fileToDelete = path.join(backupDir, backupFiles[i].name)
        fs.unlinkSync(fileToDelete)
        console.log(`[Backup] Deleted old backup file: ${fileToDelete}`)
      }
    }

  } catch (error) {
    console.error('[Backup] Backup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

runBackup()
