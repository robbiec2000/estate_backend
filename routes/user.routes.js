import express from "express";
import { deleteUser, getUser, savePost, updateUser, profilePosts, getNotificationNumber } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();

// router.get('/', getUser);

router.put('/:id', verifyToken, updateUser);

router.delete('/:id', verifyToken, deleteUser);

router.post('/save', verifyToken, savePost);

router.get('/profilePosts', verifyToken, profilePosts);

router.get('/notification', verifyToken,  getNotificationNumber);

router.get('/:id', verifyToken,  getUser);


export default router;