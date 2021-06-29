const app = require("../index");
const request = require("supertest");
const agent = request(app);
const { sign, verify } = require("jsonwebtoken");
const factory = require("./helper/factory")
const { expect, assert } = require("chai");
const https = require("https");

const dbConnector = require("../../lib/mongooseConnector");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

describe("Actorz project test code", () => {
  // before every describe
  // let db;
  // before( async () => {
  //   db = await dbConnector();
  // });

  describe("MongoDB Connect", () => {
    it("", () => {});
  });

  describe("Protocol - HTTP over Secure", () => {
    it("Server should use HTTPS protocol", () => {
      expect(app instanceof https.Server).to.equal(true);
    });
  });

  describe("User API", () => {
    let db;
    before( async () => {
      db = await dbConnector();
    });
    after(async () => {
      await db.close();
    });
    
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
          'id',
          'userId',
          'email',
          'createdAt',
          'updatedAt',
          'iat',
          'exp',
        ]);
      });
      it("로그인 성공시 전달되는 응답객체에는 refreshToken이 존재해야 합니다.", async () => {
        const res = await agent.post('/login').send({
          email: "actorz@click.com",
          password: "password",
        });
        const refreshTokenCookieExists = res.headers[
          'set-cookie'
        ].some((cookie) => cookie.includes('refreshToken'));

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
      it("", () => {});
    });

    describe("유저의 post-list, GET /api/post/:user_id", () => {
      it("", () => {});
    });

    describe("post 생성, POST /api/post/create", () => {
      it("", () => {});
    });

    describe("post 삭제, POST /api/post/:post_id/delete", () => {
      it("", () => {});
    });

    describe("post 수정, POST /api/post/:post_id/update", () => {
      it("", () => {});
    });

    describe("하나의 post 내용, GET /api/post/:post_id", () => {
      it("", () => {});
    });

    describe("post like, POST /api/post/post_id/like", () => {
      it("", () => {});
    });

    describe("post like 취소, POST /api/post/post_id/unlike", () => {
      it("", () => {});
    });

    describe("검색, GET /api/post/search?q=''&...", () => {
      it("", () => {});
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
      it("", () => {});
    });
  });
});