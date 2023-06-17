const router = require('express').Router();
const auctionManager = require('../managers/auctionManager');

//create
router.get('/create', (req, res) => {
    res.render('create')
});

router.post('/create', async (req, res) => {
    const { title, category, image, price, description } = req.body;

    await auctionManager.create({ title, category, image, price, description, author: req.user._id })

    res.redirect('/auction/browse')
});
//catalog
router.get('/browse', async (req, res) => {
    const data = await auctionManager.getAll().lean();

    res.render('browse', { data })
});

//details
router.get('/:id/details', async (req, res) => {
    const data = await auctionManager.getOne(req.params.id).populate('bidder').lean();
    if (data.author._id.toString() == req.user._id) {
        if (data.bidder == undefined) {
            data.empty = true;
        }
        res.render('details-owner', { data })
    } else {
        if (req.user._id !== data.bidder._id.toString()) {
            
            data.isBitted = false
        } else {
            data.isBitted = true
        }
        
        res.render('details', { data })
    }
});
//edit
function getOptions(category) {
    const titles = [
        'Real Estate',
        'Vehicles',
        'Furniture',
        'Electronics',
        'Other',
    ];
    const options = titles.map((title) => ({
        title: title,
        value: title.toLowerCase(),
        selected: title.toLowerCase() == category || title[0].toLowerCase().split('')[1] == category,
    }))
    return options
}
router.get('/:id/edit', async (req, res) => {
    const data = await auctionManager.getOne(req.params.id).lean();

    const options = getOptions(data.category)
    res.render('edit', { data, options })
});

router.post('/:id/edit', async (req, res) => {
    const data = req.body;
    await auctionManager.update(req.params.id, data)

    res.redirect(`/auction/${req.params.id}/details`)
});
//delete
router.get('/:id/delete', async (req, res) => {
    await auctionManager.delete(req.params.id);

    res.redirect('/auction/browse')
});

//bid
router.post('/:id/bid', async (req, res) => {
    const bidBValue = req.body;
    const offer = Object.values(bidBValue).toString();

    await auctionManager.addBidder(req.user._id, offer, req.params.id);
    res.redirect(`/auction/${req.params.id}/details`)
});


module.exports = router;