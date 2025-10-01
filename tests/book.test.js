const request = require('supertest')
const app = require('../src/app')
const Book = require('../src/models/book')
const { startInMemoryMongo, stopInMemoryMongo, setupDatabase, adminUser, normalUser, adminBookId } = require('./fixtures/db')

let adminToken
let userToken

beforeAll(async () => {
    await startInMemoryMongo()
})

beforeEach(async () => {
    await setupDatabase()
    // login admin
    const adminRes = await request(app).post('/api/users/auth/login').send({
        email: adminUser.email,
        password: adminUser.password
    })
    adminToken = adminRes.body.data.token
    // login normal user
    const userRes = await request(app).post('/api/users/auth/login').send({
        email: normalUser.email,
        password: normalUser.password
    })
    userToken = userRes.body.data.token
})

afterAll(async () => {
    await stopInMemoryMongo()
})

test('Should list books (public)', async () => {
    const res = await request(app).get('/api/books').expect(200)
    expect(Array.isArray(res.body.data.books)).toBe(true)
})

test('Should create a book when authenticated', async () => {
    const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            title: 'New Book',
            description: 'Description',
            amount: 3
        })
        .expect(201)
    const book = await Book.findById(res.body.data.book._id)
    expect(book).not.toBeNull()
})

test('Should not create a book when unauthenticated', async () => {
    await request(app)
        .post('/api/books')
        .send({ title: 'Unauthorized', description: 'Nope', amount: 1 })
        .expect(401)
})

test('Should buy a book and decrement stock', async () => {
    const before = await Book.findById(adminBookId)
    const res = await request(app)
        .post(`/api/books/${adminBookId}/buy`)
        .set('Authorization', `Bearer ${userToken}`)
        .send()
        .expect(200)
    expect(res.body.data.message).toBe('Book purchased successfully')
    const after = await Book.findById(adminBookId)
    expect(after.amount).toBe(before.amount - 1)
})

