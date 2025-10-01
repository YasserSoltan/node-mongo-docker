const mongoose = require('mongoose')
const { MongoMemoryReplSet } = require('mongodb-memory-server')
const User = require('../../src/models/user')
const Book = require('../../src/models/book')

let replset

const adminUserId = new mongoose.Types.ObjectId()
const adminUser = {
    _id: adminUserId,
    name: 'Admin User',
    age: 30,
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'admin',
}

const normalUserId = new mongoose.Types.ObjectId()
const normalUser = {
    _id: normalUserId,
    name: 'Normal User',
    email: 'user@example.com',
    password: 'userpass',
    age: 25,
    role: 'user',
}

let adminBookId = new mongoose.Types.ObjectId()
const adminBook = {
    _id: adminBookId,
    title: 'First Book',
    description: 'First book description',
    createdBy: adminUserId,
    amount: 2,
}

async function startInMemoryMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
    }
    replset = await MongoMemoryReplSet.create({
        replSet: { count: 1 }
    })
    const uri = replset.getUri()
    process.env.MONGO_URI = uri
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

    await mongoose.connect(uri)
}

async function stopInMemoryMongo() {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    if (replset) {
        await replset.stop()
    }
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Book.deleteMany()
    await new User(adminUser).save()
    await new User(normalUser).save()
    await new Book(adminBook).save()
}

module.exports = {
    startInMemoryMongo,
    stopInMemoryMongo,
    setupDatabase,
    adminUserId,
    adminUser,
    normalUserId,
    normalUser,
    adminBookId,
}