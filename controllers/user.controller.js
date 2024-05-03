import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to get users" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...rest } = req.body;

  if (id !== tokenUserId) {
    res.status(403).json({ message: " Not Authorized" });
  }
  let hashedPassword = null;
  try {
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(hashedPassword && { password: hashedPassword }),
        ...(avatar && { avatar }),
      },
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to update users" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    res.status(403).json({ message: " Not Authorized" });
  }
  res.status(200).json({ message: " User deleted" });
  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to delete users" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({where: {
      userId_postId: {
        userId: tokenUserId,
        postId: postId,
      }
    }});

    if(savedPost){
      await prisma.savedPost.delete({where: {
        id: savedPost.id,
      }})
      res.status(200).json({ message: " Post removed from saved list" });
    }else{
      await prisma.savedPost.create({data: {
        userId: tokenUserId,
        postId,
      }})
      res.status(200).json({ message: " Post saved from saved list" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to save post" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      }
    }); 
    const savedPosts = saved.map((item) => item.post);
    res.status(200).json( {userPosts, savedPosts } );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to get profile posts" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
   const chatsNumber = await prisma.chat.count({where: {
    userIds: {
      hasSome: [tokenUserId],
    },
    NOT: {
      seenBy: {
        hasSome: [tokenUserId],
      }
    }
   }});
    res.status(200).json(chatsNumber);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Fail to get profile posts" });
  }
};