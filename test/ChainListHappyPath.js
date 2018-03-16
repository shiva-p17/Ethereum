var Chainlist = artifacts.require("./Chainlist.sol");

contract("Chainlist", function (accounts) {


    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = "article 1";
    var articleDescription = "Description for article 1";
    var articlePrice = 10;
    var sellerBalbefore, sellerBalafter;
    var buyerBalbefore, buyerBalafter;


    it("should be initialized with empty values", function () {
        return Chainlist.deployed().then(function (instance) {
            return instance.getArticle();
        }).then(function (data) {
            assert.equal(data[0], 0x0, "seller must be empty");
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], "", "article name must be empty");
            assert.equal(data[3], "", "article description must be empty");
            assert.equal(data[4].toNumber(), 0, "article price must be zero");
        })
    });


    it("should sell an article", function () {
        return Chainlist.deployed().then(function (instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
        }).then(function () {
            return chainListInstance.getArticle();
        }).then(function (data) {
            assert.equal(data[0], seller, "seller must be " + seller);
            assert.equal(data[1], 0x0, "seller must be empty");
            assert.equal(data[2], articleName, "article name must be " + articleName);
            assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });

    it("should BUY an article", function () {
        return Chainlist.deployed().then(function (instance) {
            chainListInstance = instance;
            sellerBalbefore = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalbefore = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
            return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")}).then(function (receipt) {

                sellerBalafter = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
                buyerBalafter = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

                assert(sellerBalafter == sellerBalbefore + articlePrice, "Seller should earned " + articlePrice + " ETH")
                assert(buyerBalafter <= buyerBalbefore - articlePrice, "Seller should have spent " + articlePrice + " ETH")
                return chainListInstance.getArticle();
            }).then(function (data) {
                assert.equal(data[0], seller, "seller must be " + seller);
                assert.equal(data[1], buyer, "seller must be " + buyer);
                assert.equal(data[2], articleName, "article name must be " + articleName);
                assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
                assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
            })

        })

    });


})
