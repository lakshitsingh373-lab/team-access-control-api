const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise((resolve) => setTimeout(resolve, 500));
});

describe("Auth routes", () => {
  it("should reject signup with missing fields", async () => {
    const res = await request(app).post("/auth/signup").send({});
    expect(res.statusCode).toBe(500);
  });

  it("should reject login with wrong credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword"
    });
    expect(res.statusCode).toBe(400);
  });

  it("should reject login with missing password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "someone@example.com"
    });
    expect(res.statusCode).toBe(400);
  });
});