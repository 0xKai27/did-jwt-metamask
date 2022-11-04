import express from 'express';

const router: express.Router = express.Router();

/* POST JWT to be saved on user storage */
router.post('/saveJWT', async (req, res) => {

    req.session.signedJWT = req.body.signedJWT;

    res.status(200).json({
        message: "Successfully saved JWT!"
    });
});

router.get('/getJWT', async (req, res) => {
    res.status(200).json({
        message: req.session.signedJWT
    })
})

export { router as apiRouter };