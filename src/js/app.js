App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    loading: false,
    init: function () {
        // load articlesRow
        // var articlesRow = $('#articlesRow');
        // var articleTemplate = $('#articleTemplate');
        //
        // articleTemplate.find('.panel-title').text('article 1');
        // articleTemplate.find('.article-description').text('Desription for article 1');
        // articleTemplate.find('.article-price').text("10.23");
        // articleTemplate.find('.article-seller').text("0x1234567890123456890");
        // articlesRow.append(articleTemplate.html());

        return App.initWeb3();
    },

    initWeb3: function () {

        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545")
        }
        web3 = new Web3(App.web3Provider);
        App.displayAccountInfo();

        return App.initContract();
    },

    initContract: function () {
        $.getJSON('Chainlist.json', function (chainlistArtifact) {
            App.contracts.Chainlist = TruffleContract(chainlistArtifact);
            App.contracts.Chainlist.setProvider(App.web3Provider);
            App.listenToEvents();
            return App.reloadArticles();
        });
    },
    reloadArticles: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;
        App.displayAccountInfo();

        var ChainlistInstance;
        App.contracts.Chainlist.deployed().then(function (instance) {
            ChainlistInstance = instance;
            return ChainlistInstance.getgetArticlesForSale();
        }).then(function (articleIds) {
            $('#articlesRow').empty();
            for (var i = 0; i < articleIds.length; i++) {
                ChainlistInstance.articles((articleIds[i]).toNumber()).then(function (_article) {
                    App.displayArticle(_article[0], _article[1], _article[3], _article[4], _article[5])
                })
            }

            App.loading = false;
            /*if (article[0] == 0x0) {
                //There is no articles
                return;
            }
            */


        }).catch(function (err) {
            console.error(err.message)
            App.loading = false;
        })

    },
    displayArticle: function (_id, _seller, _name, _desc, _price) {
        var price = web3.fromWei(_price, "ether");
        var articleTemplate = $('#articleTemplate');

        articleTemplate.find('.panel-title').text(_name);
        articleTemplate.find('.article-description').text(_desc);
        articleTemplate.find('.article-price').text(price + " ETH");
        articleTemplate.find('.btn-buy').attr("data-value", price);
        articleTemplate.find('.btn-buy').attr("data-id", _id);

        var seller = _seller;
        if (seller == App.account) {
            seller = "You";
            articleTemplate.find('.btn-buy').hide();
        } else {
            articleTemplate.find('.btn-buy').show();
        }
        articleTemplate.find('.article-seller').text(seller);

        $('#articlesRow').append(articleTemplate.html());

    },

    displayAccountInfo: function () {
        web3.eth.getCoinbase(function (err, account) {
            if (err == null) {
                App.account = account;
                $("#account").text(account);
                web3.eth.getBalance(account, function (err, balance) {
                    if (err == null) {
                        $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH")
                    }
                })


            }
        })

    },

    sellArticle: function () {
        var article_name = $("#article_name").val();
        var article_price = web3.toWei(parseFloat($("#article_price").val() || 0), "ether");
        var article_description = $("#article_description").val();
        if (article_name.trim() == '' || article_price == 0) {
            return;
        }

        App.contracts.Chainlist.deployed().then(function (instance) {
            return instance.sellArticle(article_name, article_description, article_price, {
                from: App.account,
                gas: 500000
            }).then(function (res) {

            }).catch(function (reason) {
                console.error(reason.message);
            })
        })

    },

    listenToEvents: function () {
        App.contracts.Chainlist.deployed().then(function (instance) {
            instance.LogSellerArticle({}, {}).watch(function (err, event) {
                if (!err) {
                    $("#events").append("<li class='list-group-item'>" + event.args._name + " Is now for sale!!!</li>")
                } else
                    console.error(err.message);
                App.reloadArticles();
            });

            instance.LogBuyArticle({}, {}).watch(function (err, event) {
                if (!err) {
                    $("#events").append("<li class='list-group-item'>" + event.args._buyer + " boughts !" + event.args._name + "</li>")
                } else
                    console.error(err.message);
                App.reloadArticles();
            })
        })
    },
    buyArticle: function () {
        event.preventDefault();
       // var _price = 10;
        var _price=parseFloat($(event.target).data("value"));
        var _id=parseFloat($(event.target).data("id"));

        App.contracts.Chainlist.deployed().then(function (instance) {
            return instance.buyArticle(_id,{
                from: App.account,
                value: web3.toWei(_price, "ether"),
                gas: 5000000
            })

        }).catch(function (reason) {
            console.error(reason.message);
        });
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
