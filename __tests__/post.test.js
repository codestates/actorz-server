require("dotenv").config();
const app = require("../index");
const dbConnector = require("../lib/mongooseConnector");
const testDBsetting = require("./testDBsetting");
const { users } = require("../mongodb/models");

const request = require("supertest");
const { expect } = require("chai");
const { sign } = require("jsonwebtoken");
const https = require("https");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const agent = request(app);

describe("Actorz project test code", () => {
  let db = null;
  let user_id;
  let tokenBodyData;
  let accessToken;
  let post_id;

  before( async () => {
    db = await dbConnector(() => {
      testDBsetting();
    });
    console.log("Preparing for testing...");
  });

  before((done) => {
    setTimeout( async () => {
      await users.findOne({ name: "kimcoding" })
      .then((result) => {
        user_id = result._id;
        tokenBodyData = {
          user_id,
          email: result.email
        };
        accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET, {expiresIn: "5m"});
        done();
      })
    }, 1500);
  })

  beforeEach((done) => {
    setTimeout(() => {
      done();
    },500)
  })

  describe("MongoDB Connect", () => {
    it("MongoDB에 연결", () => {
      expect(db).is.not.null;
      expect(db.readyState).to.eql(1);
    });
  });

  describe("Protocol - HTTP over Secure", () => {
    it("Server should use HTTPS protocol", () => {
      expect(app instanceof https.Server).to.eql(true);
    });
  });

  
  describe("Post API", () => {
    describe("유저가 좋아요 표시한 post-list, GET /api/like/:user_id", () => {
      let res;
      it("params에 유저ID가 유효하지 않을 경우, 'Invalid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidUserIdRes = await agent.get("/api/like/123412345");
        expect(InvalidUserIdRes.body.message).to.eql("Invalid user ID");
        expect(InvalidUserIdRes.body.data).is.null;
        expect(InvalidUserIdRes.statusCode).to.eql(400);
      });

      it("params에 유저ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/like/${user_id}`);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });

      it("params에 유저ID가 유효한 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    });

    describe("유저의 post-list, GET /api/post/user/:user_id", () => {
      let res;
      it("params에 유저ID가 유효하지 않을 경우, 'Invalid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidUserIdRes = await agent.get("/api/post/user/123412345");
        expect(InvalidUserIdRes.body.message).to.eql("Invalid user ID");
        expect(InvalidUserIdRes.body.data).is.null;
        expect(InvalidUserIdRes.statusCode).to.eql(400);
      });

      it("params에 유저ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/post/user/${user_id}`);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
      
      it("params에 유저ID가 유효한 경우, array type의 posts가 응답에 포함되어야 합니다", () => {
        expect(Array.isArray(res.body.data.posts)).to.eql(true);
      });
    });

    describe("post 생성, POST /api/post/create", () => {
      const bodyData = {
        media: [{
          type: "img",
          path: "https://pbs.twimg.com/media/D-KFOUSU4AEKYkp.jpg"
        }],
        content: "귀엽게 째려보는 고양이",
        genre: "판타지"
      };
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const noAuthRes = await agent.post("/api/post/create")
        .send(bodyData);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post("/api/post/create")
        .send(bodyData)
        .set({"Authorization": "Bearer FakeToken"});
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post("/api/post/create")
        .send(bodyData)
        .set({"Authorization": `Bearer ${accessToken}`});
        post_id = res.body.data.id;
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("하나의 post 내용, GET /api/post/:post_id", () => {
      let res;
      it("params에 포스트ID가 유효하지 않을 경우, 'Invalid post ID'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidPostIdRes = await agent.get("/api/post/123412345");
        expect(InvalidPostIdRes.body.message).to.eql("Invalid post ID");
        expect(InvalidPostIdRes.body.data).is.null;
        expect(InvalidPostIdRes.statusCode).to.eql(400);
      });

      it("params에 포스트ID가 유효한 경우, 'ok'메세지가 응답에 포함되어야 합니다", async () => {
        res = await agent.get(`/api/post/${post_id}`);
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
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {;
        const noAuthRes = await agent.post(`/api/post/${post_id}/like`);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post(`/api/post/${post_id}/like`)
        .set({"Authorization": "Bearer FakeToken"});
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post(`/api/post/${post_id}/like`)
        .set({"Authorization": `Bearer ${accessToken}`});
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post_id);
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("post like 취소, POST /api/post/:post_id/unlike", () => {
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {;
        const noAuthRes = await agent.post(`/api/post/${post_id}/unlike`);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post(`/api/post/${post_id}/unlike`)
        .set({"Authorization": "Bearer FakeToken"});
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post(`/api/post/${post_id}/unlike`)
        .set({"Authorization": `Bearer ${accessToken}`});
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post_id);
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("post에 대한 좋아요 유무, POST /api/post/:post_id/islike", () => {
      it("요청 헤더의 Authorization 속성이 없을 경우, 'not found'메시지가 응답에 포합되어야 합니다", async () => {;
        const noAuthRes = await agent.post(`/api/post/${post_id}/islike`);
        expect(noAuthRes.body.message).to.eql("not found");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(204);
      });

      it("해당 요청을 보낼 경우, 'like'또는'unlike'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post(`/api/post/${post_id}/islike`)
        .set({"Authorization": `Bearer ${accessToken}`});
        expect(res.body.message).to.eql("like" || "unlike");
        expect(res.body.data.id).to.eql(post_id);
        expect(res.statusCode).to.eql(200);
      });
    });

    describe("post 수정, POST /api/post/:post_id/update", () => {
      const bodyData = {
        media: [{
          type: "img",
          path: "https://pbs.twimg.com/media/D-KFOUSU4AEKYkp.jpg"
        }],
        content: "귀엽게 째려보는 세상 귀여운 고양이",
        genre: "판타지"
      };
      let res;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {;
        const noAuthRes = await agent.post(`/api/post/${post_id}/update`)
        .send(bodyData);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post(`/api/post/${post_id}/update`)
        .send(bodyData)
        .set({"Authorization": "Bearer FakeToken"});
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        res = await agent.post(`/api/post/${post_id}/update`)
        .send(bodyData)
        .set({"Authorization": `Bearer ${accessToken}`});
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post_id);
        expect(res.statusCode).to.eql(200);
      });

      it("요청에 성공하였을 경우, 변경된 내용이 응답에 포함되어야 합니다", () => {
        expect(res.body.data.post).is.not.null;
        expect(res.body.data.post.media.type).to.eql(post.type);
        expect(res.body.data.post.media.path).to.eql(post.path);
        expect(res.body.data.post.content).to.eql(post.content);
        expect(res.body.data.post.genre).to.eql(post.genre);
      });
    });

    describe("post 삭제, POST /api/post/:post_id/delete", () => {
      it("요청 헤더의 Authorization 속성이 없을 경우,'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {;
        const noAuthRes = await agent.post(`/api/post/${post_id}/delete`);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post(`/api/post/${post_id}/delete`)
        .set({"Authorization": "Bearer FakeToken"});
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'Successfully post delete'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post(`/api/post/${post_id}/delete`)
        .set({"Authorization": `Bearer ${accessToken}`});
        expect(res.body.message).to.eql("Successfully post delete");
        expect(res.body.data.id).to.eql(post_id);
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
});