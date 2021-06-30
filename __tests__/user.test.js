require("dotenv").config();
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
const accessToken = sign(tokenBodyData, process.env.ACCESS_SECRET);

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

  describe("User API", () => {
    describe("로그인, POST /api/login", () => {
      it("비밀번호가 잘못된 경우: message:'Invalid user or Wrong password', status:401", async () => {
        const res = await agent.post("/api/login").send({
          email: "kimcoding@gmail.com",
          password: "kimcoding@gmail.com",
        });
        expect(res.body.message).to.eql("Invalid user or Wrong password");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
      });
      
      it("이메일이 잘못된 경우: message:'Invalid user or Wrong password', status:401", async () => {
        testUserId = await users.findOne({
          name: "kimcoding"
        }, (doc) => {
          return doc;
        });
        console.log(testUserId)
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
          email: "kimcoding@gmail.com",
          password: "1234",
        });
  
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(res.statusCode).to.eql(200);
      });
  
      it("로그인 성공: accessToekn이 포함", async () => {
        const res = await agent.post("/api/login").send({
          email: "kimcoding@gmail.com",
          password: "1234",
        });
        expect(res.body.data.accessToken).to.exist;
      });
  
      it("로그인 성공: 엑세스 토큰: 이메일 담긴 JWT 토큰", async () => {
        const res = await agent.post("/api/login").send({
          email: "kimcoding@gmail.com",
          password: "1234",
        });
        const tokenData = verify(
          res.body.data.accessToken,
          process.env.ACCESS_SECRET
        );
        expect(tokenData).to.exist;
        expect(Object.keys(tokenData)).to.eql([
          "email"
        ]);
      });
  
      it("로그인 성공:쿠키에 refreshToken", async () => {
        const res = await agent.post("/api/login").send({
          email: "kimcoding@gmail.com",
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
      code: process.env.KAKAO_CODE_TESTING,
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      client_secret: process.env.KAKAO_CLIENT_SECRET
    };
  
    const callbackRequestBody = {
      authorizationCode: "fake_auth_code"
    };
  
    describe("로그인 kakao, POST /api/login/kakao", () => {
      it("kakao access token 요청 처리", async () => {
        const scope = nock("https://kauth.kakao.com")
          .post("/oauth/token", accessTokenRequestData)
          .reply(200, accessTokenResponseData);
  
        await agent.post("/api/login/kakao").send(callbackRequestBody);
  
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount, "요구사항에 맞는 ajax 요청을 보내지 않았습니다.").to.eql(1);
      });
  
      it("access token을 받아온 후, 클라이언트에 응답으로 전달", async () => {
        const scope = nock("https://kauth.kakao.com")
          .post("/oauth/token", accessTokenRequestData)
          .reply(200, accessTokenResponseData);
        
        const res = await agent.post("/api/login/kakao").send(callbackRequestBody);
  
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount, "요구사항에 맞는 ajax 요청을 보내지 않았습니다.").to.eql(1)
        
        expect(res.statusCode).to.eql(200 || 201);
        expect(res.body.accessToken).to.eql("fake_access_token");
        expect(res.body.message).to.eql("ok");
      });
    });
  
    describe("로그인 google, POST /api/login/google", () => {
      const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
      const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
      
      const googleAccessTokenRequest = {
        code:"4/P7q7W91a-oMsCeLvIaQm6bTrgtp7",
        client_id:CLIENT_ID,
        client_secret:CLIENT_SECRET,
        redirect_uri:REDIRECT_URI,
        grant_type:"authorization_code",
      };
      
      const googleAccessTokenResponse = {
        access_token:"fake_access_token",
        expires_in:3920,
        token_type:"Bearer"
      };
  
      it("google access token 요청 처리", async () => {
        const scope = nock('https://www.googleapis.com')
          .post('/oauth2/v4/token', googleAccessTokenRequest)
          .reply(200, googleAccessTokenResponse);
        // console.log(scope)
        const res = await agent.post("/api/login/kakao").send(callbackRequestBody);
        const ajaxCallCount = scope.interceptors[0].interceptionCounter;
        expect(ajaxCallCount, "요구사항에 맞는 ajax 요청을 보내지 않았습니다.").to.eql(1);
  
        expect(res.statusCode).to.eql(200 || 201);
        expect(res.body.accessToken).to.eql("fake_access_token");
        expect(res.body.message).to.eql("ok");
      });
    });
  
    describe("로그아웃, POST /api/logout", () => {
      it("로그아웃 성공: 205, data안에 id 있어야 함, message: Successfully signed out", async () => {
        const res = await agent.post("/api/logout")
          .set({authorization: `Bearer ${accessToken}`});
  
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
  
    describe("회원가입, POST /api/signup", () => {
      const actorSignUpRequest = {
        email: "signupActor@gmail.com",
        password: "1234",
        name: "kimcoding",
        company: null,
        provider: "local",
        gender: "male",
        dob: 1900-05-05
      };
  
      const recruitorSignUpRequest = {
        email: "signupRecruit@gmail.com",
        password: "1234",
        name: "kimcoding",
        company: null,
        provider: "local",
        gender: "male",
        dob: 1900-05-05,
        recruitor: {
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
        const res = await agent.post("/api/logout")
          .send(actorSignUpRequest);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(Object.keys(res.body.data)).to.eql([
          "id"
        ]);
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(201);
      });
  
      it("성공적인 회원가입: 리크루터", async () => {
        const res = await agent.post("/api/logout")
          .send(recruitorSignUpRequest);
        expect(res.body.message).to.eql("ok");
        expect(res.body.data).is.not.null;
        expect(Object.keys(res.body.data)).to.eql([
          "id"
        ]);
        expect(res.body.data.id).is.not.null;
        expect(res.statusCode).to.eql(201);
      });
  
      it("회원가입 실패: 중복된 이메일", async () => {
        const res = await agent.post("/api/logout")
          .send(actorSignUpRequest);
        expect(res.body.message).to.eql("이미 존재하는 이메일입니다");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(409);
      });
    });
  
    describe("유저정보, GET /api/user/:user_id", () => {
      it("유저정보 성공: data:{userInfo: ...}}, message:ok", async () => {
  
        const res = await agent.get("/api/user/1")
          .set({authorization: `Bearer ${accessToken}`});
  
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
        const res = await agent.get("/api/user/1");
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.body.message).to.eql("Authorization dont exist");
      });
    });
  
    
    describe("유저정보 수정, POST /api/user/:user_id/update", () => {
      const actorUpdateRequest = {
        mainPic: "https://images.velog.io/images/dandelion/post/fc4ea522-d576-4896-9bdf-6f47635370d8/SSI_20141005135230_V.jpg",
        email: "signupActor22@gmail.com",
        password: "123456789",
        name: "changedName",
        company: "hell",
        provider: "local",
        gender: "male",
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
        const res = await agent.post("/api/user/2/update")
        .set({authorization: `Bearer ${accessToken}`})
        .send(actorUpdateRequest);
        
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
        const res = await agent.post("/api/user/2/update")
        .send(actorUpdateRequest);
        expect(res.body.data).is.null;
        expect(res.statusCode).to.eql(401);
        expect(res.body.message).to.eql("Authorization dont exist");
      });
    });
  });
  
  describe("회원탈퇴, POST /api/user/:user_id/delete", () => {
    it("로그인 상태가 아닐 때: 400, data: null, message: You are currently not logined", async () => {
      const res = await agent.post("/api/logout");
  
      expect(res.body.message).to.eql("You are currently not logined");
      expect(res.body.data).is.null;
      expect(res.statusCode).to.eql(400);
    });
  
    it("로그아웃 성공: 205, data안에 id 있어야 함, message: Successfully signed out", async () => {
      const res = await agent.post("/api/user/1/delete")
        .set({authorization: `Bearer ${accessToken}`});
  
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

