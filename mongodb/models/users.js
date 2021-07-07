require("dotenv").config();
const { model, Schema } = require("mongoose")
const findOrCreate = require ("mongoose-findorcreate")
const bcrypt = require("bcrypt");

const ObjectId = Schema.ObjectId;
const UsersSchema = new Schema({
  author: ObjectId,
  mainPic: {
    type: String,
    default: "https://ncache.ilbe.com/files/attach/new/20200206/4255758/1621045151/11231547442/2a4742fc9ee703223e7b964de8730732_11231547478.jpg"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  company: String,
  provider: {
    type: String,
    required: true,
    enum: ["local", "google", "naver"]
  },
  gender: {
    type: Boolean,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    enum: ["guest", "actor", "recruiter"],
    required: true
  },
  careers: {
    type: [{
      title: {
        type: String,
        required: true
      },
      year: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        enum: ["드라마", "영화", "뮤지컬", "연극", "광고", "뮤직비디오"],
        required: true
      }
    }]
  },
  recruiter: {
    type: {
      bName: String,
      bAddress: {
        type: {
          city: {
            type: String,
            required: true
          },
          street: {
            type: String,
            required: true
          },
          zipCode: {
            type: String,
            required: true
          }
        }
      },
      bEmail: String,
      phoneNum: String,
      jobTitle: String,
      bNumber: String,
      bNumberCert: {
        type: Boolean,
        required: true
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
UsersSchema.plugin(findOrCreate);
UsersSchema.pre("save", function(next){ 
  const user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS), function(err, salt){
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
UsersSchema.methods.comparePassword = function(reqPassword, callback){
  const user = this;
  bcrypt.compare(reqPassword, user.password, (err, isMatch) => {
    if(err) callback(err);
    callback(null, isMatch);
  });
};
module.exports = model("users", UsersSchema);