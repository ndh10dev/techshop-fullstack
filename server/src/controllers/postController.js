import { Post } from "../models/Post.js";
import { HttpError } from "../utils/httpError.js";

export async function listPosts(req, res, next) {
  try {
    const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) throw new HttpError(404, "Post not found");
    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) throw new HttpError(404, "Post not found");
    await post.update(req.body);
    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) throw new HttpError(404, "Post not found");
    await post.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

