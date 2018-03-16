var Chainlist = artifacts.require("./Chainlist.sol");

contract("Chainlist", function (accounts) {

    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = "article 1";
    var articleDescription = "Description for article 1";
    var articlePrice = 10;

    it("should throw exception if you buy and when there is no product",function () {
        return Chainlist.deployed().then(function (instance) {
            chainListInstance=instance;
            return chainListInstance.buyArticle({
                from:buyer,
                value:web3.toWei(articlePrice,"ether")
            })
        }).then(assert.fail)
            .catch(function (err) {
                assert(true);
            }).then(function (value) {
                return chainListInstance.getArticle();
            }).then(function (data) {
                assert.equal(data[0], 0x0, "seller must be empty");
                assert.equal(data[1], 0x0, "buyer must be empty");
                assert.equal(data[2], articleName, "article name must be empty"+ articleName);
                assert.equal(data[3], articleDescription, "article description must be" +articleDescription);
                assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice,"ether") );

            })
    })

});

