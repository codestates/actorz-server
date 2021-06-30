
const app = require("../index");
const dbConnector = require("../lib/mongooseConnector");
const testDBsetting = require("./testDBsetting");
const { users, posts, tags, post_user, portfolio } = require("../mongodb/models");


const request = require("supertest");
const { expect } = require("chai");
const { sign, verify } = require("jsonwebtoken");
const https = require("https");
const nock = require("nock");
const { google } = require("googleapis");

const agent = request(app);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const tokenBodyData = {
  email: "kimcoding@gmail.com",
};
const accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET, {expiresIn: "5m"});

describe("Actorz project test code", () => {
  let db = null;

  before( async () => {
    db = await dbConnector(() => {
      testDBsetting();
    });
    console.log("Preparing for testing...");
  });

  before((done) => {
    setTimeout(() => {
      done();
    }, 1500);
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
      let user;
      let res;
      it("params에 유저ID가 유효하지 않을 경우, 'Invalid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        user = await users.findOne({ name: "kimcoding" });
        const InvalidUserIdRes = await agent.get("/api/like/123412345");
        expect(InvalidUserIdRes.body.message).to.eql("Invalid user ID");
        expect(InvalidUserIdRes.body.data).is.null;
        expect(InvalidUserIdRes.statusCode).to.eql(400);
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
      it("params에 유저ID가 유효하지 않을 경우, 'Invalid user ID'메세지가 응답에 포함되어야 합니다", async () => {
        user = await users.findOne({ name: "kimcoding" });
        const InvalidUserIdRes = await agent.get("/api/post/123412345");
        expect(InvalidUserIdRes.body.message).to.eql("Invalid user ID");
        expect(InvalidUserIdRes.body.data).is.null;
        expect(InvalidUserIdRes.statusCode).to.eql(400);
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
      const bodyData = {
        type: "img",
        path: "https://pbs.twimg.com/media/D-KFOUSU4AEKYkp.jpg",
        content: "귀엽게 째려보는 고양이",
        genre: "시크",
        tags: ["레깨비"]
      };

      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const noAuthRes = await agent.post("/api/post/create", bodyData);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const InvalidAuthRes = await agent.post("/api/post/create", bodyData, { headers });
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        const res = await agent.post("/api/post/create", bodyData, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(201);
      });
    });

    describe("하나의 post 내용, GET /api/post/:post_id", () => {
      let post;
      let res;
      it("params에 포스트ID가 유효하지 않을 경우, 'Invalid post ID'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" })
        const InvalidPostIdRes = await agent.get("/api/post/123412345");
        expect(InvalidPostIdRes.body.message).to.eql("Invalid post ID");
        expect(InvalidPostIdRes.body.data).is.null;
        expect(InvalidPostIdRes.statusCode).to.eql(400);
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
        const noAuthRes = await agent.post(`/api/post/${post._id}/like`, null);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const InvalidAuthRes = await agent.post(`/api/post/${post._id}/like`, null, { headers });
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
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
        const noAuthRes = await agent.post(`/api/post/${post._id}/unlike`, null);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const InvalidAuthRes = await agent.post(`/api/post/${post._id}/unlike`, null, { headers });
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });

      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
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
        const noAuthRes = await agent.post(`/api/post/${post._id}/islike`, null);
        expect(noAuthRes.body.message).to.eql("not found");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(204);
      });
      it("해당 요청을 보낼 경우, 'like'또는'unlike'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
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
      const bodyData = {
        type: "img",
        path: "https://ncache.ilbe.com/files/attach/new/20200206/4255758/1621045151/11231547442/2a4742fc9ee703223e7b964de8730732_11231547478.jpg",
        content: "세상 귀여운 고양이",
        genre: "귀욤",
        tags: ["도깨비"]
      };
      let res;
      it("요청 헤더의 Authorization 속성이 없을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        post = await posts.findOne({ content: "귀여운 고양이" });
        const noAuthRes = await agent.post(`/api/post/${post._id}/update`, bodyData);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const InvalidAuthRes = await agent.post(`/api/post/${post._id}/update`, bodyData, { headers });
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
        const headers = {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        };
        res = await agent.post(`/api/post/${post._id}/update`, bodyData, { headers });
        expect(res.body.message).to.eql("ok");
        expect(res.body.data.id).to.eql(post._id);
        expect(res.statusCode).to.eql(200);
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
        const noAuthRes = await agent.post(`/api/post/${post._id}/delete`);
        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const headers = {
          "Authorization": "Bearer FakeToken",
          "Content-Type": "application/json"
        };
        const InvalidAuthRes = await agent.post(`/api/post/${post._id}/delete`, null, { headers });
        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'Successfully post delete'메시지가 응답에 포함되어야 합니다", async () => {
        const user = await users.findOne({ name: "kimcoding" });
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
});