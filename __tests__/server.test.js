require("dotenv").config();
const app = require("../index");
const dbConnector = require("../lib/mongooseConnector");
const testDBsetting = require("./testDBsetting");
const { users, posts, tags, post_user, portfolio } = require("../mongodb/models");

const request = require("supertest");
const { expect } = require("chai");
const { sign, verify } = require("jsonwebtoken");
const https = require("https");

const agent = request(app);
const ACCESS_SECRET = process.env.ACCESS_SECRET;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

describe("Actorz project test code", () => {
  let db = null;
  before( async () => {
    db = await dbConnector(() => {
      testDBsetting();
    });
  });

  describe("MongoDB Connect", () => {
    it("MongoDB에 연결", () => {
      expect(db).is.not.null;
    });
  });

  describe("Protocol - HTTP over Secure", () => {
    it("Server should use HTTPS protocol", () => {
      expect(app instanceof https.Server).to.eql(true);
    });
  });

  describe("User API", () => {
    describe("로그인, POST /api/login", () => {
      it("로그인 요청시 전달받은 비밀번호가 잘못된 경우, 'Invalid user or Wrong password'메세지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post("/api/login").send({
          email: "actorz@click.com",
          password: "thisIsWrongPassword",
        });
        expect(res.body.message).to.eql("Invalid user or Wrong password");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
      });

      it("로그인 요청시 전달받은 이메일이 잘못된 경우, 'Invalid user or Wrong password'메세지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post("/api/login").send({
          email: "wrongEmail@click.com",
          password: "password",
        });
        expect(res.body.message).to.eql("Invalid user or Wrong password");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
      });

      it("로그인 요청시 전달받은 유저 이메일, 비밀번호가 데이터베이스에 저장된 정보와 완벽히 일치하는 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post("/api/login").send({
          email: "actorz@click.com",
          password: "password",
        });

        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });

      it("로그인 요청시 전달받은 유저 이메일, 비밀번호가 데이터베이스에 저장된 정보와 완벽히 일치하는 경우, 응답에 accessToekn이 포함되어야 합니다", async () => {
        const res = await agent.post("/api/login").send({
          email: "actorz@click.com",
          password: "password",
        });
        expect(res.body.data.accessToken).to.exist;
      });

      it("응답에 전달되는 엑세스 토큰은 유저정보가 담긴 JWT 토큰이여만 합니다.", async () => {
        const res = await agent.post("/api/login").send({
          email: "actorz@click.com",
          password: "password",
        });
        const tokenData = verify(
          res.body.data.accessToken,
          process.env.ACCESS_SECRET
        );
        expect(tokenData).to.exist;
        expect(Object.keys(tokenData)).to.eql([ // 마찬가지로 수정 필요함. 토큰 안에 내용 뭐가 들어갈지...
          "id",
          "userId",
          "email",
          "createdAt",
          "updatedAt",
          "iat",
          "exp",
        ]);
      });
      it("로그인 성공시 전달되는 응답객체에는 refreshToken이 존재해야 합니다.", async () => {
        const res = await agent.post("/login").send({
          email: "actorz@click.com",
          password: "password",
        });
        const refreshTokenCookieExists = res.headers[
          "set-cookie"
        ].some((cookie) => cookie.includes("refreshToken"));

        expect(refreshTokenCookieExists).to.eql(true);
      });
    });

    describe("로그인 google, POST /api/login/google", () => {
      it("", () => {});
    });

    describe("로그인 kakao, POST /api/login/kakao", () => {
      it("", () => {});
    });

    describe("로그아웃, POST /api/logout", () => {
      it("", () => {});
    });

    describe("회원가입, POST /api/signup", () => {
      it("", () => {});
    });

    describe("유저정보, GET /api/user/:user_id", () => {
      it("", () => {});
    });

    describe("회원탈퇴, POST /api/user/:user_id/delete", () => {
      it("", () => {});
    });

    describe("유저정보 수정, POST /api/user/:user_id/update", () => {
      it("", () => {});
    });
  });

  describe("Post API", () => {
    describe("유저가 좋아요 표시한 post-list, GET /api/like/:user_id", () => {
      let user;
      let res;
      it("params에 유저ID가 유효하지 않을 경우, 'Not valid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        user = await users.findOne({ name: "kimcoding" });
        const notValidUserIdRes = await agent.get("/api/like/123412345");
        expect(notValidUserIdRes.body.message).to.eql("Invalid user or Wrong password");
        expect(notValidUserIdRes.body.data).is.null;
        expect(notValidUserIdRes.statusCode).to.eql(400);
      });

      it("params에 유저ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/like/${user._id}`);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });

      it("params에 유저ID가 유효한 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    });

    describe("유저의 post-list, GET /api/post/:user_id", () => {
      let user;
      let res;
      it("params에 유저ID가 유효하지 않을 경우, 'Not valid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        user = await users.findOne({ name: "kimcoding" });
        const notValidUserIdRes = await agent.get("/api/post/123412345");
        expect(notValidUserIdRes.body.message).to.eql("Not valid user ID");
        expect(notValidUserIdRes.body.data).is.null;
        expect(notValidUserIdRes.statusCode).to.eql(400);
      });

      it("params에 유저ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/post/${user._id}`);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
      
      it("params에 유저ID가 유효한 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    });

    describe("post 생성, POST /api/post/create", () => {
      const postData = {
        type: "img",
        path: "https://pbs.twimg.com/media/D-KFOUSU4AEKYkp.jpg",
        content: "귀엽게 째려보는 고양이",
        genre: "시크",
        tags: ["레깨비"]
      };

      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const notAuthRes = await agent.post("/api/post/create", postData);
        expect(notAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const notValidAuthRes = await agent.post("/api/post/create", postData, { headers });
        expect(notValidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notValidAuthRes.body.data).is.null;
        expect(notValidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post("/api/post/create", postData, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("하나의 post 내용, GET /api/post/:post_id", () => {
      let post;
      let res;
      it("params에 포스트ID가 유효하지 않을 경우, 'Not valid post ID'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" })
        const notValidPostIdRes = await agent.get("/api/post/123412345");
        expect(notValidPostIdRes.body.message).to.eql("Not valid post ID");
        expect(notValidPostIdRes.body.data).is.null;
        expect(notValidPostIdRes.statusCode).to.eql(400);
      });

      it("params에 포스트ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/post/${post._id}`);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
      
      it("params에 포스트ID가 유효한 경우, post가 응답에 포함되어야 합니다", () => {
        expect(res.body.data.post).is.not.null;
      });
    });

    describe("post-list, GET /api/post", () => {
      let res;
      it("해당 요청을 보낼 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get("/api/post");
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });

      it("해당 요청을 보낼 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    })

    describe("post like, POST /api/post/:post_id/like", () => {
      let post;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const notAuthRes = await agent.post(`/api/post/${post._id}/like`, null);
        expect(notAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const notValidAuthRes = await agent.post(`/api/post/${post._id}/like`, null, { headers });
        expect(notValidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notValidAuthRes.body.data).is.null;
        expect(notValidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post(`/api/post/${post._id}/like`, null, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("post like 취소, POST /api/post/:post_id/unlike", () => {
      let post;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const notAuthRes = await agent.post(`/api/post/${post._id}/unlike`, null);
        expect(notAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const notValidAuthRes = await agent.post(`/api/post/${post._id}/unlike`, null, { headers });
        expect(notValidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notValidAuthRes.body.data).is.null;
        expect(notValidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post(`/api/post/${post._id}/unlike`, null, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("post에 대한 좋아요 유무, POST /api/post/:post_id/islike", () => {
      let post;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'not found'메시지가 응답에 포합되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const notAuthRes = await agent.post(`/api/post/${post._id}/islike`, null);
        expect(notAuthRes.body.message).to.eql("not found");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(204);
      });
      it("해당 요청을 보낼 경우, 'like'또는'unlike'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post(`/api/post/${post._id}/islike`, null, { headers });
        expect(res.body.message).to.eql("like" || "unlike");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(200);
      });
    });

    describe("post 수정, POST /api/post/:post_id/update", () => {
      let post;
      const updatePost = {
        type: "img",
        path: "https://ncache.ilbe.com/files/attach/new/20200206/4255758/1621045151/11231547442/2a4742fc9ee703223e7b964de8730732_11231547478.jpg",
        content: "세상 귀여운 고양이",
        genre: "귀욤",
        tags: ["도깨비"]
      };
      let res;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const notAuthRes = await agent.post(`/api/post/${post._id}/update`, updatePost);
        expect(notAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const notValidAuthRes = await agent.post(`/api/post/${post._id}/update`, updatePost, { headers });
        expect(notValidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notValidAuthRes.body.data).is.null;
        expect(notValidAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        res = await agent.post(`/api/post/${post._id}/update`, updatePost, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(201);
      });
      it("요청에 성공하였을 경우, 변경된 내용이 응답에 포함되어야 합니다", () => {
        expect(res.body.data.post).is.not.null;
        expect(res.body.data.post.type).to.eql(post.type);
        expect(res.body.data.post.path).to.eql(post.path);
        expect(res.body.data.post.content).to.eql(post.content);
        expect(res.body.data.post.genre).to.eql(post.genre);
        expect(res.body.data.post.tags.length).to.eql(post.tags.length);
      });
    });

    describe("post 삭제, POST /api/post/:post_id/delete", () => {
      let post;
      it("요청 헤더의 Authorization 속성이 없을 경우,'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const notAuthRes = await agent.post(`/api/post/${post._id}/delete`);
        expect(notAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notAuthRes.body.data).is.null;
        expect(notAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const notValidAuthRes = await agent.post(`/api/post/${post._id}/delete`, null, { headers });
        expect(notValidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(notValidAuthRes.body.data).is.null;
        expect(notValidAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'Successfully post delete'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const accessToken = sign({ user_id: user._id }, ACCESS_SECRET, { expiresIn: "30s" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post(`/api/post/${post._id}/delete`, null, { headers });
        expect(res.body.message).to.eql("Successfully post delete");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(200);
      });
    });

    describe("검색, GET /api/post/search", () => {
      let res;
      it("해당 요청을 보낼 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get("/api/post/search");
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });

      it("해당 요청을 보낼 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    });
  });

  describe("Portfolio API", () => {
    describe("portfolio 정보, GET /api/portfolio/:user_id", () => {
      it("", () => {});
    });

    describe("portfolio 생성, POST /api/portfolio/:user_id/create", () => {
      it("", () => {});
    });

    describe("portfolio 수정, POST /api/portfolio/:user_id/update", () => {
      it("", () => {});
    });

    describe("portfolio 삭제, POST /api/portfolio/:user_id/delete", () => {
      it("", () => {});
    });
  });

  describe("S3 bucket API", () => {
    describe("url 요청, POST /api/upload", () => {
      it("응답코드 201, data: url, message: ok 를 받아야합니다", async () => {
        const tokenBodyData = { // 일단 엔지니어님 코드를 복붙 했습니다. 추후 수정 필요합니다
          id: 1,
          userId: "kimcoding",
          email: "kimcoding@codestates.com",
          createdAt: "2020-11-18T10:00:00.000Z",
          updatedAt: "2020-11-18T10:00:00.000Z",
        };
        const accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET);
        
        const res = await agent
        .get("/api/upload")
        .set({authorization: `Bearer ${accessToken}`});;

        expect(res.body.data, "url이 존재해야합니다").to.exist;
        expect(res.body.data, "url이 null이면 안됩니다").not.null;
        expect(res.body.data, "url이 string타입이어야 합니다").to.be.a("string");
        expect(res.statusCode).to.eql(201);
        expect(res.body.message).to.eql("ok");
      });
    });
    describe("url 요청 에러핸들링, POST /api/upload", () => {
      it("응답코드 401, data: null, message: Authorization dont exist 를 받아야합니다", async () => {
        const res = await agent.get("/api/upload");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.body.message).to.eql("Authorization dont exist");
      });
    });
  });

  after(async () => {
    await db.close();
  })
});