const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {
  startInMemoryMongo,
  stopInMemoryMongo,
  setupDatabase,
  adminUser,
  normalUser,
} = require("./fixtures/db");

test("Health check endpoint", async () => {
  await request(app).get("/health").expect(200);
});

beforeAll(async () => {
    await startInMemoryMongo()
})

beforeEach(async () => {
    await setupDatabase()
})

afterAll(async () => {
    await stopInMemoryMongo()
})

test('Should signup a new user', async () => {
    const response = await request(app).post('/api/users/auth/signup').send({
        name: 'Ahmed',
        email: 'ahmed@example.com',
        password: '12345678',
        age: 22
    }).expect(201)

    const user = await User.findById(response.body.data.user._id)
    expect(user).not.toBeNull()
    expect(user.password).not.toBe('12345678')
})

test('Should login existing user and receive token', async () => {
    const response = await request(app).post('/api/users/auth/login').send({
        email: adminUser.email,
        password: adminUser.password
    }).expect(200)
    expect(response.body.token).toBeDefined()
})

test('Should not login with wrong password', async () => {
    await request(app).post('/api/users/auth/login').send({
        email: adminUser.email,
        password: 'wrongpass'
    }).expect(401)
})
