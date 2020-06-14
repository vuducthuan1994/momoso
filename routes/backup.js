let express = require('express');
let router = express.Router();
let fs = require('fs');
var path = require('path');
const Settings = require('../models/settingModel');
const Posts = require('../models/postsModel');
const helper = require('../helper/Helper');
require('dotenv').config();
const util = require('../helper/Helper');

// sitemap import lib
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
let sitemap;

module.exports = function(cache) {
    router.use(function(req, res, next) {
        next();
    });


    router.get('/api/posts/:id', function(req, res) {
        const postId = req.params.id;
        Posts.findOne({ _id: postId }, function(err, post) {
            if (!err) {
                res.status(200).json({ success: true, post: post, created_date: helper.getDateArtiles(post.created_date) });
            }

        })
    });
    // Trang chu
    router.get('/', async function(req, res) {
        res.json("OKK");
        // let config = cache.get("config");
        // if (config == undefined) {
        //     config = await getConfig();
        //     cache.set("config", config);
        // }

        // let introduction = cache.get("introduction");
        // if (introduction == undefined) {
        //     introduction = await getIntroduction();
        //     cache.set("introduction", introduction);
        // }

        // let posts = cache.get("posts");
        // if (posts == undefined) {
        //     posts = await getPosts();
        //     cache.set("posts", posts);
        // }

        // let textSliders = cache.get("textSliders");
        // if (textSliders == undefined) {
        //     textSliders = await getTextSliders();
        //     cache.set("textSliders", textSliders);
        // }

        // let projects = cache.get("projects");
        // if (projects == undefined) {
        //     projects = await getProjects();
        //     cache.set("projects", projects);
        // }

        // let images_project = cache.get("images_project");
        // if (images_project == undefined) {
        //     images_project = await getImagesProject();
        //     cache.set("images_project", images_project);
        // }
        // res.render('client/index', {
        //     projects: projects,
        //     host: req.get('host'),
        //     posts: posts.map(post => post.toJSON()),
        //     textSliders: textSliders,
        //     introduction: introduction,
        //     images_project: images_project,
        //     config: config,
        //     layout: 'layout.hbs'
        // });
    });
    router.get('/pdf/:fileName', function(req, res) {
        const fileName = req.params.fileName;
        const pathFilePdf = path.join(__basedir, `public/pdf/${fileName}`);
        var data = fs.readFileSync(pathFilePdf);
        res.contentType("application/pdf");
        res.send(data);
    });
    let getConfig = function() {
        return new Promise(function(resolve, reject) {
            Settings.findOne({ type: 'config' }, function(err, config) {
                if (!err) {
                    resolve(config.content);
                }
            });
        });
    }

    let getProjects = function() {
        return new Promise(function(resolve, reject) {
            Settings.findOne({ type: 'projects' }, function(err, projects) {
                if (!err) {
                    resolve(projects.content);
                }
            });
        });
    }

    let getPosts = function() {
        return new Promise(function(resolve, reject) {
            Posts.find({ isPublic: true }, function(err, posts) {
                if (!err) {
                    resolve(posts);
                }
            });
        });
    }
    let getImagesProject = function() {
        return new Promise(function(resolve, reject) {
            Settings.findOne({ type: 'images-project' }, function(err, images_project) {
                if (!err) {
                    resolve(images_project.content);
                }
            });
        });
    }

    let getIntroduction = function() {
        return new Promise(function(resolve, reject) {
            Settings.findOne({ type: 'introduction' }, function(err, introduction) {
                if (!err) {
                    resolve(introduction.content);
                }
            });
        });
    }

    let getTextSliders = function() {
        return new Promise(function(resolve, reject) {
            Settings.findOne({ type: 'text-sliders' }, function(err, text_sliders) {
                if (!err) {
                    resolve(text_sliders.content);
                }
            });
        });
    }



    // sitemap
    router.get('/sitemap.xml', async function(req, res) {
        res.header("Content-Type", "application/xml; charset=utf-8");

        res.header('Content-Encoding', 'gzip');
        // if we have a cached entry send it
        if (sitemap) {
            res.send(sitemap)
            return
        }
        try {
            const BASE_URL = `${req.protocol}://${req.get('host')}`;
            const smStream = new SitemapStream({ hostname: BASE_URL })
            const pipeline = smStream.pipe(createGzip())

            // pipe your entries or directly write them.
            smStream.write({ url: BASE_URL, changefreq: 'daily', priority: 1, img: BASE_URL + '/img/homepage.png' })


            for (let i = 0; i < req.config.top_music.length; i++) {
                const link = util.buildRouteSearch(req.config.top_music[i]);
                smStream.write({ url: link, changefreq: 'always', priority: 0.9 }, 'ASCII')
            }
            for (let i = 0; i < req.config.top_itunes.length; i++) {
                const link = util.buildRouteSearch(req.config.top_itunes[i].name);
                smStream.write({ url: link, changefreq: 'always', priority: 0.8 }, 'ASCII')
            }
            let songs = await getAllSongs();
            for (let i = 0; i < songs.length; i++) {
                const link = util.buildRouteSearch(songs[i].name);
                smStream.write({ url: link, changefreq: 'always', priority: 0.8 }, 'ASCII')
            }
            smStream.end()

            // cache the response
            streamToPromise(pipeline).then(sm => sitemap = sm)
                // stream write the response
            pipeline.pipe(res).on('error', (e) => { throw e })
        } catch (e) {
            console.error(e)
            res.status(500).end()
        }
    });


    return router;
}