const app = require("../index");
const server = request(app);
const AWSMock = require('mock-aws-s3');
const { expect, assert } = require("chai");
const https = require("https");

describe("Actorz project test code", () => {
  describe("MongoDB Connect", () => {
    it("", () => {});
  });

  describe("Protocol - HTTP over Secure", () => {
    it("Server should use HTTPS protocol", () => {
      expect(app instanceof https.Server).to.equal(true);
    });
  });

  describe("User API", () => {
    describe("로그인, POST /api/login", () => {
      it("", () => {});
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
      it("응답코드 201, data: url, message: ok 를 받아야합니다", () => {
        const res = await server
        .get("/api/upload")
        .set({
          authorization: 'token fake_access_token' // token handler 수정해야함
        });
        expect(res.data, "url이 존재해야합니다").to.exist;
        expect(res.data, "url이 null이면 안됩니다").not.null;
        expect(res.data, "url이 string타입이어야 합니다").to.be.a("string");
        expect(res.statusCode).to.eql(201);
        expect(res.message).to.eql("ok");
      });
    });
    describe("url 요청 에러핸들링, POST /api/upload", () => {
      it("응답코드 401, data: null, message: Authorization dont exist 를 받아야합니다", () => {
        const res = await server.get("/api/upload");
        expect(res.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.message).to.eql("Authorization dont exist");
      });
    });
  });
});