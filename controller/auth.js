const User = require('../model/user');
const UserRole = require('../model/user_role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { USER_ROLES } = require('../config/constant');
const avatarGenerate = require('../services/avatar-generate');

exports.signup = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const affiliation = req.body.affiliation;
    const biography = req.body.biography;
    const toBeReviewer = req.body.toBeReviewer;
    try {
        const userCheck = await User.findOne({ username: username });
        const emailCheck = await User.findOne({ email: email });
        if (userCheck || emailCheck) {
            if (userCheck) {
                res.status(401).json({
                    error: 'Tài khoản hoặc đã tồn tại!'
                });
            }
            if (emailCheck) {
                res.status(401).json({
                    error: 'Email này đã được đăng ký!'
                });
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 12);
            // let role = null;
            // if (toBeReviewer) {
            //     role = await UserRole.findOne(USER_ROLES.REVIEWER);
            // }
            // else {
            //     role = await UserRole.findOne(USER_ROLES.AUTHOR);
            // }
            const role = toBeReviewer ? await UserRole.findOne(USER_ROLES.REVIEWER) : await UserRole.findOne(USER_ROLES.AUTHOR);

            const avatar = avatarGenerate(firstname, lastname);

            const user = new User({
                username: username,
                email: email,
                password: hashedPassword,
                firstname: firstname,
                lastname: lastname,
                affiliation: affiliation,
                biography: biography,
                avatar: avatar,
                role: role
            });

            const newUser = await user.save();
            res.status(201).json({
                message: 'Đăng ký tài khoản thành công!',
                userId: newUser._id
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};

exports.signin = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ username: username })
            .populate({ path: 'role', select: 'name' });
        if (!user) {
            res.status(401).json({
                error: 'Tài khoản không tồn tại!'
            });
        }
        loadedUser = user;
        const isEqualPw = await bcrypt.compare(password, loadedUser.password);
        if (!isEqualPw) {
            res.status(401).json({
                error: 'Tài khoản hoặc mật khẩu không đúng!'
            });
        }
        const token = jwt.sign(
            {
                username: loadedUser.username,
                userId: loadedUser._id.toString(),
                fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
                role: loadedUser.role
            },
            config.JWT_SECRET,
            { expiresIn: '12h' }
        );
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token: token,
            userId: loadedUser._id.toString(),
            fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
            avatar: loadedUser.avatar,
            role: loadedUser.role
        })
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};