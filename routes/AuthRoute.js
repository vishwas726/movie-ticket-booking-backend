import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../lib/jwtToken.js";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {

      const userExist=await User.findOne({email})
      if(userExist){
    res.json({ success: false, message:"User Alredy Exists" });

      }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
     

     
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    const newUser = await user.save();
    const token = generateToken(user._id);


    res.json({ success: true, token, user, newUser });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Dosen't Exist" });
    }

    const checkPassword = await bcrypt.compare( password,user.password);

    if (!checkPassword) {
      return res.json({ success: false, message: "Incorrect Password" });
    }

    const token = generateToken(user._id);

    res.json({ success: true, token, user });

  } catch (error) {
    console.log(error);
  }
});

export default router;
