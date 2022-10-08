const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require ('../../models/Profile');
const User = require ('../../models/User');
const { check, validationResult} = require('express-validator');
const request = require('request');
const config = require('config');


//@route    GET api/profile/me
//@desc     Get current users profile 
//@access   private

router.get('/me', auth, async (req,res) => {
    try {

        const profile = await Profile.findOne({user: req.user.id}).populate('user', [ 'name', 'avatar']);

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }

        res.json(profile);


    }catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

//@route    POST api/profile/
//@desc     Create or update user profile
//@access   private

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skill is required ').not().isEmpty()

]], 
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    } 

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin

    } = req.body;


    //build profile object 
    const profileFields = {};

    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;

    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //build social object. if there are nested objects you need to initialize the similar level of nest in your variable 
    profileFields.social = {};

    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.youtube = twitter;
    if(facebook) profileFields.social.youtube = facebook;
    if(linkedin) profileFields.social.youtube = linkedin;
    if(instagram) profileFields.social.youtube = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id});
        //update if tehre 
        if(profile){
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                { $set: profileFields},
                { new:true }
                );
            return res.json(profile);
        }

        //create if not there
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);

        
        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }




})

//@route    GET api/profile/
//@desc     Get all profiles
//@access   public

router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

//@route    GET api/profile/user/:user_id
//@desc     Get profile by user_id
//@access   public

router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({msg: 'Profile not found'});



        res.json(profile);


        
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server error');
    }
})


//@route    DELETE api/profile/
//@desc     Delete profile, user and posts 
//@access   private

router.delete('/', auth, async (req,res) => {
    try {
        //@todo remove user posts

        //remote profile
        await Profile.findOneAndRemove({ user: req.user.id});

        //remove user 
        await User.findOneAndRemove({ _id: req.user.id});

        res.json({ msg: 'User Deleted'});
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

//@route    PUT api/profile/experience
//@desc     Add profile experience 
//@access   private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()

]], async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});

    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        
        await profile.save();

        res.json(profile);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   private

router.delete('/experience/:exp_id', auth, async (req,res)=> {
    try {
        const profile = await Profile.findOne({ user : req.user.id});

        //get remove index 
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();

        res.json(profile);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route    Get api/profile/github/:username
//@desc     get user repos from GitHub
//@access   public

router.get('/github/:username', (req, res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };

        request(options, (error, response, body) => {
            if(error) console.erorr(error);

            if (response.statusCode !== 200) {
                return res.status(400).json({ msg: 'No Github profile found'});
            }

            res.json(JSON.parse(body));
        })
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error'); 
    }
})

//@todo routers for adding and deleting education 

module.exports = router;
