const { model, Schema } = require("mongoose")

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
    enum: ["local", "google", "kakao"]
  },
  gender: {
    type: Boolean,
    required: true
  },
  dob: {
    type: Date,
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
      jobTitle: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ["guest", "actor", "recruiter"],
    default: "guest"
  }
});

module.exports = model("users", UsersSchema);