const User = require('../model/user');
const UserRole = require('../model/user_role');
const Notification = require('../model/notification');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { USER_ROLES, NOTIFICATION_TYPE } = require('../config/constant');
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
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.signin = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User
            .findOne({ username: username })
            .populate('role');
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Tài khoản hoặc mật khẩu không đúng!'
            });
        } else {
            loadedUser = user;
            const isEqualPw = await bcrypt.compare(password, loadedUser.password);
            if (!isEqualPw) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    error: 'Tài khoản hoặc mật khẩu không đúng!'
                });
            } else {
                const token = jwt.sign(
                    {
                        username: loadedUser.username,
                        userId: loadedUser._id.toString(),
                        fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
                        avatar: loadedUser.avatar,
                        role: loadedUser.role
                    },
                    config.JWT_SECRET,
                    { expiresIn: '7d' }
                );
                res.status(StatusCodes.OK).json({
                    message: 'Đăng nhập thành công!',
                    token: token,
                    userId: loadedUser._id.toString(),
                    fullname: loadedUser.lastname + ' ' + loadedUser.firstname,
                    avatar: loadedUser.avatar,
                    role: loadedUser.role
                });
            }
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
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
                NOTIFICATION_TYPE.EDITOR_TO_CHIEF_EDITOR
            ];
            notifications = await Notification
                .find({
                    type: { $in: types }
                })
                .sort({ _id: -1 })
                .limit(6);
        } else {
            notifications = await Notification
                .find({
                    receiverId: receiverId
                })
                .sort({ _id: -1 })
                .limit(6);
        }
        res.status(StatusCodes.OK).json({
            notifications: notifications
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getAllMyNotifications = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 6;
    const receiverId = req.user.userId;
    const permission = req.user.role.permissionLevel;
    try {
        let notifications = null;
        let total = 0;
        if (permission === USER_ROLES.CHIEF_EDITOR.permissionLevel) {
            const types = [
                NOTIFICATION_TYPE.AUTHOR_TO_CHIEF_EDITOR,
                NOTIFICATION_TYPE.EDITOR_TO_CHIEF_EDITOR
            ];
            total = await Notification.countDocuments({ type: { $in: types } });
            notifications = await Notification
                .find({
                    type: { $in: types }
                })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .sort({ _id: -1 });
        } else {
            total = await Notification.find({ receiverId: receiverId }).countDocuments();
            notifications = await Notification
                .find({
                    receiverId: receiverId
                })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .sort({ _id: -1 });
        }
        res.status(StatusCodes.OK).json({
            notifications: notifications,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};