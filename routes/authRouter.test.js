import mongoose from "mongoose";
import request from "supertest";
import "dotenv/config";
import app from "../app.js";

import { findUser, clearUsers } from "../services/authServices.js";

const { DB_HOST, PORT = 3000 } = process.env;

const loginData = {
  email: "alex@gmail.com",
  password: "123456",
};

describe("test /login route", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_HOST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {});

  afterEach(async () => {});

  test("/login returns status code 200", async () => {
    const response = await request(app).post("/users/login").send(loginData);
    expect(response.status).toBe(200);
  });

  test("/login returns token ", async () => {
    const response = await request(app).post("/users/login").send(loginData);

    expect(response.body.token).toBeDefined();
  });

  test("/login returns user ", async () => {
    const response = await request(app).post("/users/login").send(loginData);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(loginData.email);
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });
});
