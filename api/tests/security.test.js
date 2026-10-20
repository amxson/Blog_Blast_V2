import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { google, signin } from "../controllers/auth.controller.js";
import {
  updatepost,
  deletepost,
  cleanPostContent,
} from "../controllers/post.controller.js";
import { googleAuth } from "../services/googleAuth.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { verifyToken } from "../middleware/verifyUser.js";
import jwt from "jsonwebtoken";

function response() {
  return {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("Google sign-in rejects an unverified email-only request", async () => {
  const find = mock.method(User, "findOne", () => {
    throw Error("must not query");
  });
  let error;
  await google(
    { body: { email: "victim@example.com" } },
    response(),
    (value) => {
      error = value;
    },
  );
  assert.equal(error.statusCode, 401);
  assert.equal(find.mock.callCount(), 0);
  find.mock.restore();
});
test("invalid Firebase token cannot reach accounts", async () => {
  const verify = mock.method(googleAuth, "verify", async () => {
    throw Error("bad signature");
  });
  const find = mock.method(User, "findOne", () => {
    throw Error("must not query");
  });
  let error;
  await google({ body: { idToken: "forged" } }, response(), (value) => {
    error = value;
  });
  assert.equal(error.statusCode, 401);
  assert.equal(find.mock.callCount(), 0);
  verify.mock.restore();
  find.mock.restore();
});
test("NoSQL object credentials are rejected before lookup", async () => {
  let error;
  await signin(
    { body: { email: { $ne: null }, password: "password" } },
    response(),
    (value) => {
      error = value;
    },
  );
  assert.equal(error.statusCode, 400);
});
for (const [name, handler, operation] of [
  ["update", updatepost, "findByIdAndUpdate"],
  ["delete", deletepost, "findByIdAndDelete"],
]) {
  test(`another author cannot ${name} a post, even with a forged URL user ID`, async () => {
    const find = mock.method(Post, "findById", async () => ({
      _id: "post",
      userId: "owner",
    }));
    const write = mock.method(Post, operation, () => {
      throw Error("must not write");
    });
    let error;
    await handler(
      {
        user: { id: "attacker" },
        params: { postId: "post", userId: "attacker" },
        body: { title: "hijack" },
      },
      response(),
      (value) => {
        error = value;
      },
    );
    assert.equal(error.statusCode, 403);
    assert.equal(write.mock.callCount(), 0);
    find.mock.restore();
    write.mock.restore();
  });
}
test("missing posts return 404", async () => {
  const find = mock.method(Post, "findById", async () => null);
  let error;
  await deletepost(
    { user: { id: "owner" }, params: { postId: "missing" } },
    response(),
    (value) => {
      error = value;
    },
  );
  assert.equal(error.statusCode, 404);
  find.mock.restore();
});
test("stored rich text removes active HTML and unsafe URLs", () => {
  const html = cleanPostContent(
    '<p>hello</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
  );
  assert.match(html, /<p>hello<\/p>/);
  assert.doesNotMatch(html, /script|onerror|javascript:/i);
});
test("admin authority is loaded from the current account", async () => {
  process.env.JWT_SECRET = "unit-test-signing-key";
  const token = jwt.sign({ id: "user", isAdmin: true }, process.env.JWT_SECRET);
  const find = mock.method(User, "findById", async () => ({
    _id: "user",
    isAdmin: false,
    tokenVersion: 0,
  }));
  const req = { cookies: { access_token: token } };
  let error;
  await verifyToken(req, response(), (value) => {
    error = value;
  });
  assert.equal(error, undefined);
  assert.equal(req.user.isAdmin, false);
  find.mock.restore();
});
test("password changes revoke old session tokens", async () => {
  process.env.JWT_SECRET = "unit-test-signing-key";
  const token = jwt.sign({ id: "user", version: 0 }, process.env.JWT_SECRET);
  const find = mock.method(User, "findById", async () => ({
    _id: "user",
    tokenVersion: 1,
  }));
  let error;
  await verifyToken(
    { cookies: { access_token: token } },
    response(),
    (value) => {
      error = value;
    },
  );
  assert.equal(error.statusCode, 401);
  find.mock.restore();
});
