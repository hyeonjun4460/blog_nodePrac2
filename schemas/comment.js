const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: String,
    nickname: String,
    password: String,
});
UserSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});


// virtual 을 json에포함해서 전송
UserSchema.set("toJSON", {
    virtuals: true,
});
module.exports = mongoose.model("User", UserSchema);