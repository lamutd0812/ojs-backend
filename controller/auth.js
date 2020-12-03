const User = require('../model/user');
const UserRole = require('../model/user_role');
const Notification = require('../model/notification');
const { StatusCodes } = require('http-status-codes');
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
        const userCheck = await User.exists({ username: username });
        const emailCheck = await User.exists({ email: email });
        if (userCheck || emailCheck) {
            if (userCheck) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    error: 'Tài khoản này đã tồn tại!'
                });
            }
            if (emailCheck) {
                res.status(StatusCodes.UNAUTHORIZED).json({
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
            res.status(StatusCodes.CREATED).json({
                message: 'Đăng ký tài khoản thành công!',
                userId: newUser._id
            });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
            .populate('role');
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Tài khoản hoặc mật khẩu không đúng!'
            });
        }
        loadedUser = user;
        const isEqualPw = await bcrypt.compare(password, loadedUser.password);
        if (!isEqualPw) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Tài khoản hoặc mật khẩu không đúng!'
            });
        }
        const token = jwt.sign(
            {
                username: loadedUser.username,
                userId: loadedUser._id.toString(),
                fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
                avatar: loadedUser.avatar,
                role: loadedUser.role
            },
            config.JWT_SECRET,
            { expiresIn: '12h' }
        );
        res.status(StatusCodes.OK).json({
            message: 'Đăng nhập thành công!',
            token: token,
            userId: loadedUser._id.toString(),
            fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
            avatar: loadedUser.avatar,
            role: loadedUser.role
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
        console.log(err);
    }
};

exports.getMyNotifications = async (req, res) => {
    const receiverId = req.user.userId;
    const permission = req.user.role.permissionLevel;
    try {
        let notifications = null;
        if (permission === USER_ROLES.CHIEF_EDITOR.permissionLevel) {
            const types = [
                NOTIFICATION_TYPE.AUTHOR_TO_CHIEF_EDITOR,
                NOTIFICATION_TYPE.CHIEF_EDITOR_TO_EDITOR,
                NOTIFICATION_TYPE.EDITOR_TO_CHIEF_EDITOR,
                NOTIFICATION_TYPE.CHIEF_EDITOR_TO_AUTHOR
            ];
            notifications = await Notification.find({
                type: { $in: types }
            })
        } else {
            notifications = await Notification.find({ receiverId: receiverId });
        }
        res.status(StatusCodes.OK).json({
            notifications: notifications
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    }
};