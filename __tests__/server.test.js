require("dotenv").config();
const app = require("../index");
const dbConnector = require("../lib/mongooseConnector");
const testDBsetting = require("./testDBsetting");
const { users, posts, portfolio } = require("../mongodb/models");

const request = require("supertest");
const { expect } = require("chai");
const { sign } = require("jsonwebtoken");
const https = require("https");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const agent = request(app);

describe("Actorz project test code", () => {
  let db = null;
  let user_id;
  let password;
  let tokenBodyData;
  let accessToken;

  before( async () => {
    db = await dbConnector();
    testDBsetting();
    console.log("Preparing for testing...");
  });

  before((done) => {
    setTimeout(() => {
      users.findOne({ name: "kimcoding" })
      .then((result) => {
        user_id = result._id;
        password = result.password;
        tokenBodyData = {
          user_id,
          email: result.email
        };
        accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET, {expiresIn: "5m"});
      })
      done();
    }, 2000);
  })

  beforeEach((done) => {
    setTimeout(() => {
      done();
    },1000)
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

  describe("Portfolio API", () => {
    describe("portfolio 삭제, POST /api/portfolio/:user_id/delete", () => {
      it("요청 헤더의 Authorization 속성이 없을 경우,'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const noAuthRes = await agent.post(`/api/portfolio/${user_id}/delete`);

        expect(noAuthRes.body.message).to.eql("Authorization dont exist");
        expect(noAuthRes.body.data).is.null;
        expect(noAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
        const InvalidAuthRes = await agent.post(`/api/portfolio/${user_id}/delete`)
        .set({"Authorization": "Bearer FakeToken"});

        expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
        expect(InvalidAuthRes.body.data).is.null;
        expect(InvalidAuthRes.statusCode).to.eql(401);
      });
      
      it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'Successfully portfolio delete'메시지가 응답에 포함되어야 합니다", async () => {
        const res = await agent.post(`/api/portfolio/${user_id}/delete`)
        .set({"Authorization": `Bearer ${accessToken}`});

        expect(res.body.message).to.eql("Successfully portfolio delete");
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
    });

    // describe("portfolio 생성, POST /api/portfolio/:user_id/create", () => {
    //   let bodyData;

    //   it("요청 헤더의 Authorization 속성이 없을 경우,'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
    //     const postsData = await posts.find({ "userInfo.user_id": user_id});
    //     bodyData = {
    //       password,
    //       posts: postsData
    //     };
    //     const noAuthRes = await agent.post(`/api/portfolio/${user_id}/create`)
    //     .send(bodyData);

    //     expect(noAuthRes.body.message).to.eql("Authorization dont exist");
    //     expect(noAuthRes.body.data).is.null;
    //     expect(noAuthRes.statusCode).to.eql(401);
    //   });
      
    //   it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
    //     const InvalidAuthRes = await agent.post(`/api/portfolio/${user_id}/create`)
    //     .send(bodyData)
    //     .set({"Authorization": "Bearer FakeToken"});

    //     expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
    //     expect(InvalidAuthRes.body.data).is.null;
    //     expect(InvalidAuthRes.statusCode).to.eql(401);
    //   });
      
    //   it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
    //     const res = await agent.post(`/api/portfolio/${user_id}/create`)
    //     .send(bodyData)
    //     .set({"Authorization": `Bearer ${accessToken}`});

    //     expect(res.body.message).to.eql("ok");
    //     expect(res.body.data.id).is.not.null;
    //     expect(res.statusCode).to.eql(201);
    //   });
    // });

    // describe("portfolio 정보, GET /api/portfolio/:user_id", () => {
    //   let res;
    //   it("params에 유저ID가 유효하지 않은 경우, 'Invalid user ID'메세지가 응답에 포함되어야 합니다", async () => {
    //     const InvalidUserIdRes = await agent.get("/api/portfolio/12341234");

    //     expect(InvalidUserIdRes.body.message).to.eql("Invalid user ID");
    //     expect(InvalidUserIdRes.body.data).is.null;
    //     expect(InvalidUserIdRes.statusCode).to.eql(400);
    //   });

    //   it("해당 요청을 보낼 경우, 'ok'메세지가 응답에 포합되어야 합니다", async () => {
    //     res = await agent.get(`/api/portfolio/${user_id}`);

    //     expect(res.body.message).to.eql("ok");
    //     expect(res.body.data).is.not.null;
    //     expect(res.statusCode).to.eql(200);
    //   });

    //   it("해당 요청을 보낼 경우, portfolio가 응답에 포함되어야 합니다", () => {
    //     expect(res.body.data.portfolio).is.not.null;
    //   });
    // });

    // describe("portfolio 수정, POST /api/portfolio/:user_id/update", () => {
    //   let bodyData = {
    //     password,
    //     posts: []
    //   };
    //   it("요청 헤더의 Authorization 속성이 없을 경우,'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
    //     const noAuthRes = await agent.post(`/api/portfolio/${user_id}/update`)
    //     .send(bodyData);

    //     expect(noAuthRes.body.message).to.eql("Authorization dont exist");
    //     expect(noAuthRes.body.data).is.null;
    //     expect(noAuthRes.statusCode).to.eql(401);
    //   });
      
    //   it("요청 헤더의 Authorization 속성에 유효하지 않은 토큰이 담겨 있을 경우, 'Authorization dont exist'메세지가 응답에 포함되어야 합니다", async () => {
    //     const InvalidAuthRes = await agent.post(`/api/portfolio/${user_id}/update`)
    //     .send(bodyData)
    //     .set({"Authorization": "Bearer FakeToken"});

    //     expect(InvalidAuthRes.body.message).to.eql("Authorization dont exist");
    //     expect(InvalidAuthRes.body.data).is.null;
    //     expect(InvalidAuthRes.statusCode).to.eql(401);
    //   });
      
    //   it("요청 헤더의 Authorization 속성에 유효한 토큰이 담겨 있을 경우, 'ok'메시지가 응답에 포함되어야 합니다", async () => {
    //     const res = await agent.post(`/api/portfolio/${user_id}/update`)
    //     .send(bodyData)
    //     .set({"Authorization": `Bearer ${accessToken}`});

    //     expect(res.body.message).to.eql("ok");
    //     expect(res.body.data.id).is.not.null;
    //     expect(res.statusCode).to.eql(200);
    //   });
    // });
  });

  // describe("S3 bucket API", () => {
  //   describe("url 요청, POST /api/upload", () => {
  //     it("응답코드 201, data: url, message: ok 를 받아야합니다", async () => {
  //       const res = await agent
  //         .get("/api/upload")
  //         .set({authorization: `Bearer ${accessToken}`});

  //       expect(res.body.data, "url이 존재해야합니다").to.exist;
  //       expect(res.body.data, "url이 null이면 안됩니다").not.null;
  //       expect(res.body.data, "url이 string타입이어야 합니다").to.be.a("string");
  //       expect(res.statusCode).to.eql(201);
  //       expect(res.body.message).to.eql("ok");
  //     });
  //   });
  //   describe("url 요청 에러핸들링, POST /api/upload", () => {
  //     it("응답코드 401, data: null, message: Authorization dont exist 를 받아야합니다", async () => {
  //       const res = await agent.get("/api/upload");
  //       expect(res.body.data).is.null;
  //       expect(res.statusCode).to.eql(401);
  //       expect(res.body.message).to.eql("Authorization dont exist");
  //     });
  //   });
  // });

  after(async () => {
    await db.close();
  })
});