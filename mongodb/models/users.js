require("dotenv").config();
const { model, Schema } = require("mongoose")
const findOrCreate = require ("mongoose-findorcreate")
const bcrypt = require("bcrypt");

const ObjectId = Schema.ObjectId;
const UsersSchema = new Schema({
  author: ObjectId,
  mainPic: {
    type: String,
    default: "data:image/jpeg;base64,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"
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