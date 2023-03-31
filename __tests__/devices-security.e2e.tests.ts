import {app} from "../src/settings";
import request from "supertest"
import {response} from "express";
import {body} from "express-validator";



const auth = {login: 'admin', password: 'qwerty'}

describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('POST -> "/users": should create new user; status 201; ' +
        'used additional methods: GET => /users;', async () => {

        const createdResponseUser = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "login": "test12",
                "password": "test12",
                "email": "test12@mail.com"
            })
            .expect(201)

        const createdUser = createdResponseUser.body

        const expectedUser = {
            id: expect.any(String),
            login: "test12",
            email: "test12@mail.com",
            createdAt: createdUser.createdAt
        }

        expect(createdUser).toEqual(expectedUser)

        const users = []
        users.push(createdUser)

        const getUser = await request(app)
            .get('/users/' + '?'+ 'sortDirection=asc'+ '&pageSize=20'+ '&page=1')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .expect(200, {
                "pagesCount": 1,
                "page": 1,
                "pageSize": 20,
                "totalCount": users.length,
                "items": users
            })
    }),

        it('GET -> "/security/devices": login user 1 time, then get device list; status 200; content: device list;' +
            'used additional methods: POST => /auth/login ', async () => {

            const loginInSystem = await request(app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "test12",
                    "password": "test12"
                })
                .expect(200)

            const myCookies = loginInSystem.headers['set-cookie'][0]

            expect(loginInSystem.body).toMatchObject({
                "accessToken": expect.any(String)
            });

            expect(myCookies).toBeDefined()


            const getAllUserDevices = await request(app)
                .get("/security/devices")
                .set('Cookie', myCookies)
                .expect(200)

            const expectedDevices = [{
                        ip: expect.any(String),
                        title: expect.any(String),
                        lastActiveDate: expect.any(String),
                        deviceId: expect.any(String)
                    }]

            expect(getAllUserDevices.body).toEqual(expectedDevices)

        })

})