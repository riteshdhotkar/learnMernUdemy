const express = require('express');
const router = express.Router();
const { check, validationResult} = require('express-validator');
const auth = require ('../../middleware/auth');
const User = require( '../../models/User');
const Post = require('../../models/Post');
const Profile = require ('../../models/Profile');


//@route    Post api/posts
//@desc     create a post
//@access   private

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req,res)=> {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errrors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
    
        });

        const post = await newPost.save();

        res.json(post);
        
    } catch (err) {
        
        console.error(err.message);
        res.status(500).send('Server error')
    }



});


//@route    GET api/posts
//@desc     GET all posts
//@access   private

router.get('/', auth, async (req,res)=> {

    try {

        const posts = await Post.find().sort({ date: -1 });

        res.json(posts);
        
    } catch (err) {
        
        console.error(err.message);
        res.status(500).send('Server error')
    }

});

//@route    GET api/posts/:id
//@desc     GET posts by ID 
//@access   private

router.get('/:id', auth, async (req,res)=> {

    try {

        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ msg: 'Post not found'});
        }

        res.json(post);
        
    } catch (err) {
        
        console.error(err.message);

        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server error')
    }

});

//@route    DELETE api/posts
//@desc     DELETE a post 
//@access   private

router.delete('/:id', auth, async (req,res)=> {

    try {

        const post = await Post.findById(req.params.id);


        if(!post) {
            return res.status(404).json({ msg: 'Post not found'});
        }

        //check post belongs to user 

        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized'});
        }


        await post.remove();

        res.json({ msg: 'Post removed'});
        
        
    } catch (err) {
        
        console.error(err.message);

        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server error')
    }

});


//@route    PUT api/posts/like/:id
//@desc     Like a post
//@access   private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0) {
            return res.status(400).json({ msg: 'Post already liked'})
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//@route    PUT api/posts/unlike/:id
//@desc     unLike a post
//@access   private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post not liked yet'})
        }

        //get remove index

        const removeIndex = post.likes.map(like => like.user.toString().indexOf(req.user.id));

        post.likes.splice(removeIndex, 1);


        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//@route    Post api/posts/comment/:id
//@desc     comment on post
//@access   private

router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req,res)=> {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errrors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment =  {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
    
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post);
        
    } catch (err) {
        
        console.error(err.message);
        res.status(500).send('Server error')
    }



});

//@route    Detele api/posts/comment/:id/:comment_id
//@desc     delete comment
//@access   private

router.delete( '/comment/:id/:commnet_id', auth , async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        //pull out comment 

        const comment = post.comments.find(comment => comment.id === req.params.commnet_id);

        //make sure comment exists 

        if(!comment){
            return res.status(404).json({ msg: 'Comment does not exist'})
        }

        //check user

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'User not authorized'})
        }

        // get removeIndex
        const removeIndex = post.comments.map(comment => comment.user.toString().indexOf(req.user.id));

        post.comments.splice(removeIndex, 1);


        await post.save();

        res.json(post.comments);

        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }

} )

module.exports = router;
