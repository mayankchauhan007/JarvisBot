import User from "../models/User.js";
import { compare, hash } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constant.js";
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: "OK !", users });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR !", cause: error.message });
    }
};
export const userSignup = async (req, res, next) => {
    try {
        // user signup
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(401).send("User already registered !!");
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        // create token and store cookie
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: process.env.DOMAIN,
            signed: true,
            path: "/",
        });
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: process.env.DOMAIN,
            expires,
            httpOnly: true,
            signed: true,
        });
        return res
            .status(201)
            .json({ message: "OK !", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR !", cause: error.message });
    }
};
export const userLogin = async (req, res, next) => {
    try {
        // user login
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User is not registered.");
        }
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).send("Incorrect Password !!");
        }
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: process.env.DOMAIN,
            signed: true,
            path: "/",
        });
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: process.env.DOMAIN,
            expires,
            httpOnly: true,
            signed: true,
        });
        return res
            .status(200)
            .json({ message: "OK !", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR !", cause: error.message });
    }
};
export const verifyUser = async (req, res, next) => {
    try {
        // get the user if already loggedin and cookies not expired
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .send("User is not registered Or Token Malfunctioned");
        }
        console.log(user._id.toString(), res.locals.jwtData.id);
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res
                .status(401)
                .send("Permissions didn't match ");
        }
        return res
            .status(200)
            .json({ message: "OK !", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR !", cause: error.message });
    }
};
//# sourceMappingURL=user-controllers.js.map