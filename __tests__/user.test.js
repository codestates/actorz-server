require("dotenv").config();
const app = require("../index");
const dbConnector = require("../lib/mongooseConnector");
// const testDBsetting = require("./testDBsetting");
const { users } = require("../mongodb/models");

const request = require("supertest");
const { expect } = require("chai");
const { sign, verify } = require("jsonwebtoken");
const https = require("https");
// const nock = require("nock");
// const { google } = require("googleapis");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const agent = request(app);


describe("Actorz project test code", () => {
  let db = null;
  let recruiter;
  let actor;
  let actorToken, recruiterToken;

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
        tokenBodyData = {
          user_id,
          email: result.email
        };
        accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET, {expiresIn: "5m"});
      })
      done();
    }, 4000);
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
  
  describe("회원가입, POST /api/signup", () => {
    const actorSignUpRequest = {
      email: "signupActor@gmail.com",
      password: "1234",
      name: "actor",
      company: null,
      provider: "local",
      gender: false,
      dob: 1900-05-05
    };

    const recruiterSignUpRequest = {
      email: "signupRecruit@gmail.com",
      password: "1234",
      name: "recruiter",
      company: null,
      provider: "local",
      gender: false,
      dob: 1900-05-05,
      recruiter: {
        bName: "카카오",
        dAddress: {
          city: "제주",
          street: "제주시 첨단로 242",
          zipCode: "63309"
        },
        bEmail: "toesa@naver.com",
        phoneNum: "010-0000-0000",
        jobTitle: "인턴"
      }
    };

    it("성공적인 회원가입: 배우", async () => {
      const res = await agent.post("/api/signup")
      .send(actorSignUpRequest);
      
      actor = await users.findOne({name: "actor"}, (doc) => doc);
      actorToken = sign({
        id: actor.id,
        email: actor.email
      }, process.env.ACCESS_SECRET, {expiresIn: 60*60*3});

      expect(actor).is.not.null;

      expect(res.body.message).to.eql("ok");
      expect(res.body.data).is.not.null;
      expect(Object.keys(res.body.data)).to.eql([
        "id",
        "postUserId"
      ]);
      expect(res.body.data.id).is.not.null;
      expect(res.body.data.postUserId).is.not.null;
      expect(res.statusCode).to.eql(201);
    });

    it("성공적인 회원가입: 리크루터", async () => {
      const res = await agent.post("/api/signup")
      .send(recruiterSignUpRequest);

      recruiter = await users.findOne({name: "recruiter"}, (doc) => doc);
      recruiterToken = sign({
        id: recruiter.id,
        email: recruiter.email
      }, process.env.ACCESS_SECRET, {expiresIn: 60*60*3});

      expect(recruiter).is.not.null;

      expect(res.body.message).to.eql("ok");
      expect(res.body.data).is.not.null;
      expect(Object.keys(res.body.data)).to.eql([
        "id",
        "postUserId"
      ]);
      expect(res.body.data.id).is.not.null;
      expect(res.body.data.postUserId).is.not.null;
      expect(res.statusCode).to.eql(201);
    });

    it("회원가입 실패: 중복된 이메일", async () => {
      const res = await agent.post("/api/signup")
      .send(actorSignUpRequest);

      expect(res.body.message).to.eql("이미 존재하는 이메일입니다");
      expect(res.body.data).is.null;
      expect(res.statusCode).to.eql(409);
    });
  });

  describe("User API", () => {
    describe("로그인, POST /api/login", () => {
      it("비밀번호가 잘못된 경우: message:'Invalid user or Wrong password', status:401", async () => {
        const res = await agent.post("/api/login").send({
          email: "signupRecruit@gmail.com",
          password: "signupRecruit@gmail.com",
        });

        expect(res.body.message).to.eql("Invalid user or Wrong password");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
      });
      
      it("이메일이 잘못된 경우: message:'Invalid user or Wrong password', status:401", async () => {
        const res = await agent.post("/api/login").send({
          email: "wrongEmail@click.com",
          password: "1234",
        });

        expect(res.body.message).to.eql("Invalid user or Wrong password");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
  
      });
  
      it("로그인 성공: 'ok'메세지", async () => {
        const res = await agent.post("/api/login").send({
          email: "signupRecruit@gmail.com",
          password: "1234",
        });
        
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
  
      it("로그인 성공: accessToekn이 포함", async () => {
        const res = await agent.post("/api/login").send({
          email: "signupRecruit@gmail.com",
          password: "1234",
        });
        expect(res.body.data.accessToken).to.exist;
      });
  
      it("로그인 성공: 엑세스 토큰: 이메일 담긴 JWT 토큰", async () => {
        const res = await agent.post("/api/login").send({
          email: "signupRecruit@gmail.com",
          password: "1234",
        });
        const tokenData = verify(
          res.body.data.accessToken,
          process.env.ACCESS_SECRET
        );
        expect(tokenData).to.exist;
        expect(Object.keys(tokenData)).to.eql([
          "id",
          "email",
          "iat",
          "exp"
        ]);
      });
  
      it("로그인 성공:쿠키에 refreshToken", async () => {
        const res = await agent.post("/api/login").send({
          email: "signupRecruit@gmail.com",
          password: "1234",
        });
        const refreshTokenCookieExists = res.headers[
          "set-cookie"
        ].some((cookie) => cookie.includes("refreshToken"));
  
        expect(refreshTokenCookieExists).to.eql(true);
      });
    });
  
    const accessTokenResponseData = {
      access_token: "fake_access_token",
      token_type: "Bearer",
      scope: "user"
    };
  
    const accessTokenRequestData = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: "fake_auth_code"
    };
  
    const callbackRequestBody = {
      authorizationCode: "fake_auth_code"
    };
  
    describe("로그인 google, POST /api/login/google", () => {
 
      it("google access token 요청 처리", async () => {

      });
    });
  
    describe("로그아웃, POST /api/logout", () => {
      it("로그아웃 성공: 205, data안에 id 있어야 함, message: Successfully signed out", async () => {
        const res = await agent.post("/api/logout")
        .set({authorization: `Bearer ${actorToken}`});
  
        expect(res.body.message).to.eql("Successfully signed out");
        expect(res.body.data).is.not.null;
        expect(Object.keys(res.body.data)).to.eql([
          "id"
        ]);
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(205);
      });
  
      it("로그인 상태가 아닐 때: 400, data: null, message: You are currently not logined", async () => {
        const res = await agent.post("/api/logout");
  
        expect(res.body.message).to.eql("You are currently not logined");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(400);
      });
    });
  
  
    describe("유저정보, GET /api/user/:user_id", () => {
      it("유저정보 성공: data:{userInfo: ...}}, message:ok", async () => {
  
        const res = await agent.get(`/api/user/${actor.id}`)
        .set({authorization: `Bearer ${actorToken}`});
  
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(Object.keys(res.body.data)).to.eql([
          "userInfo"
        ]);
        expect(res.body.data.userInfo).is.not.null;
        expect(Object.keys(res.body.data.userInfo)).to.eql([
          "id",
          "mainPic",
          "email",
          "name",
          "company",
          "provider",
          "gender",
          "dob",
          "careers"
        ]);
        expect(res.statusCode).to.eql(200);
      });
  
      it("권한없음: 응답코드 401, data: null, message: Authorization dont exist 를 받아야합니다", async () => {
        const res = await agent.get(`/api/user/${actor.id}`);
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.body.message).to.eql("Authorization dont exist");
      });
    });
  
    
    describe("유저정보 수정, POST /api/user/:user_id/update", async () => {
      const actorUpdateRequest = {
        mainPic: "https://images.velog.io/images/dandelion/post/fc4ea522-d576-4896-9bdf-6f47635370d8/SSI_20141005135230_V.jpg",
        email: "signupActor@gmail.com",
        password: "123456789",
        name: "changedActor",
        company: "hell",
        provider: "local",
        gender: false,
        dob: 1900-05-05,
        careers: [
          {
            title: "에일리언",
            year:2020,
            type:["코미디"]
          },
          {
            title: "도깨비",
            year:2016,
            type:["액션","판타지"]
          }
        ]
      };

      it("유저정보 수정 성공", async () => {
        const res = await agent.post(`/api/user/${actor.id}/update`)
        .set({authorization: `Bearer ${actorToken}`})
        .send(actorUpdateRequest);
        
        // console.log(res.body)
        actor = await users.findOne({name: actorUpdateRequest.name});
        expect(actor.name).to.eql("changedActor");

        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(Object.keys(res.body.data)).to.eql([
          "userInfo"
        ]);
        expect(res.body.data.userInfo).is.not.null;
        expect(Object.keys(res.body.data.userInfo)).to.eql([
          "id",
          "mainPic",
          "email",
          "name",
          "company",
          "provider",
          "gender",
          "dob",
          "careers"
        ]);
      });
      
      it("권한없음: 응답코드 401, data: null, message: Authorization dont exist 를 받아야합니다", async () => {
        const res = await agent.post(`/api/user/${actor.id}/update`)
        .send(actorUpdateRequest);

        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.body.message).to.eql("Authorization dont exist");
      });
    });
  });
  
  describe("회원탈퇴, POST /api/user/:user_id/delete", () => {
    it("로그인 상태가 아닐 때: 400, data: null, message: You are currently not logined", async () => {
      const res = await agent.post(`/api/user/${actor.id}/delete`);
      
      const deleteUser = await users.findOne({name: actor.name}, (doc) => doc);
      expect(deleteUser).is.not.null;
      expect(res.body.message).to.eql("You are currently not logined");
      expect(res.body.data).is.null;
      expect(res.statusCode).to.eql(400);
    });
  
    it("회원탈퇴 성공: 205, data안에 id 있어야 함, message: Successfully signed out", async () => {
      const res = await agent.post(`/api/user/${actor.id}/delete`)
      .set({authorization: `Bearer ${actorToken}`});

      const deleteUser = await users.findOne({name: actor.name}, (doc) => doc);
      
      expect(deleteUser).is.null;
      expect(res.body.message).to.eql("Successfully signed out");
      expect(res.body.data).is.not.null;
      expect(Object.keys(res.body.data)).to.eql([
        "id"
      ]);
      expect(res.body.data.id).is.not.null;
      expect(res.statusCode).to.eql(205);
    });

    it("회원탈퇴 성공: 리크루터: 205, data안에 id 있어야 함, message: Successfully signed out", async () => {
      const res = await agent.post(`/api/user/${recruiter.id}/delete`)
      .set({authorization: `Bearer ${recruiterToken}`});

      const deleteUser = await users.findOne({name: recruiter.name}, (doc) => doc);
      // console.log(deleteUser)
      expect(deleteUser).is.null;
      expect(res.body.message).to.eql("Successfully signed out");
      expect(res.body.data).is.not.null;
      expect(Object.keys(res.body.data)).to.eql([
        "id"
      ]);
      expect(res.body.data.id).is.not.null;
      expect(res.statusCode).to.eql(205);
    });
  });
});
